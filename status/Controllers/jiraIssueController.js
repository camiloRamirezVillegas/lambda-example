
require("dotenv").config();
// const s3Helper = require("../Helpers/s3Helper");
const fs = require("fs");
const {createIssueBulk, addAttachmentToIssue } = require("../Helpers/jiraIssuesHelper");
const { createtIssuesArray } = require("./issueCreation");
const { parameterStore } = require ("./../../../libs/parameterStore")
const { dynamoQuery, parseDynamoObject } = require ("./../../../libs/dbbHelper")
const s3Helper = require ("./../../../libs/s3Helper")
const logger = require('../../../libs/logger');

/**
 * Creates the issues related to the project previously created (Stories and sub-tasks)
 *
 * @param {*} userInfo Information of the user that perform the Jira popullation
 * @param {*} event Lambda invokation event
 * @param {*} projectKey Jira project key
 * @param {*} component Project component
 * @param {*} accountName Account client name
 * @returns
 */
async function createProjectIssues(userInfo, event, projectKey, component, accountName) {
    let groupObject = {};
    let arrayGroupIssuesCreate = [];
    let arrayGroupIssuesInfo = [];
    let arrayIssuesAttach = [];
    let storyNoGroupSteps = {};
    let arrayIssuesCreated = [];
    let paramsGetPdd = {
      TableName: process.env.PDD_TABLE_NAME,
      ConsistentRead: false,
      ExpressionAttributeNames: {
        "#pk": "PK",
        "#sk": "SK"
      },
      ExpressionAttributeValues: {
        ":pk": {
          S: event.process
        },
        ":sk": {
          S: `#${event.pddVersion}`
        }
      },
      KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)"
    };
    let pddSteps = [];
    logger.info("paramsGetPdd : " + JSON.stringify(paramsGetPdd))
  
    // 0. Retrieve the pdd steps information from dynamoDB
    const responseQuery = await dynamoQuery(paramsGetPdd);
    console.log("responseQuery: ", JSON.stringify(responseQuery))

    // const pddDynamoInfo = (await dynamoQuery(paramsGetPdd)).Items.map(itemMeeting => {
    const pddDynamoInfo = responseQuery.Items.map(itemMeeting => {
      let dataParsed = parseDynamoObject(itemMeeting);
      return dataParsed;
    });;
    logger.info('pddDynamoInfo: ' + JSON.stringify(pddDynamoInfo))

    // 1. Organize the dynamo pdd info into the jira issue structure
    pddSteps = pddDynamoInfo.map(pddItem => {
      if(pddItem.SK.startsWith("#"+event.pddVersion+"#subProcess")){
        logger.info('SubProcess Info: ' + JSON.stringify(pddItem))
        
        groupObject[pddItem.SK.replace("#"+event.pddVersion+"#","")] = {
          name: pddItem.name,
          tasks: []
        };

        const moduleEvaluation = 'estimationType' in pddItem && pddItem.estimationType !== ' ';

        const nameCreate = pddItem.jiraStory && pddItem.jiraStory !== " " ? pddItem.jiraStory : pddItem.name;
        let issue = {
          fields: {
            project: {
              key: projectKey
            },
            description: `For the sub-group: ${nameCreate}, ${pddItem.description}\n
            Estimation: ${ moduleEvaluation ? pddItem.estimationType : 'Not asigned'}\n
            Module: ${moduleEvaluation && 'moduleName' in pddItem && pddItem.moduleName !== ' ' ? pddItem.moduleName : 'Not asigned'}`,
            summary: nameCreate,
            issuetype: {
              id: userInfo.storyId
            }
          }
        }

        if(accountName === 'pwc'){
          issue['fields']['customfield_11100'] = "Default acceptance criteria";
          issue['fields']['components'] = [{
            id: component.id
          }];
        }

        arrayGroupIssuesCreate.push(issue);
        arrayGroupIssuesInfo.push(pddItem.SK.replace("#"+event.pddVersion+"#",""));
      }
      return pddItem
    });
  
    // 2. Add an extra story to contain the steps that does not have a group associated
    arrayGroupIssuesCreate.push(accountName === 'pwc' ? {
      fields: {
        components: [{
          id: component.id
        }],
        customfield_11100: "Default acceptance criteria",
        project: {
          key: projectKey
        },
        description: `Story that contains the steps that haven't been asigned to a sub-group`,
        summary: "Other steps",
        issuetype: {
          id: "10001"
        }
      }
    }
    : {
      fields: {
        project: {
          key: projectKey
        },
        description: `Story that contains the steps that haven't been asigned to a sub-group`,
        summary: "Other steps",
        issuetype: {
          id: "10001"
        }
      }
    });
    logger.info("Stories issues array to create: " + JSON.stringify(arrayGroupIssuesCreate));

    // 3. Create the jira stories
    const resultCreateIssues = await createIssueBulk(userInfo, arrayGroupIssuesCreate)
    logger.info("resultCreateIssues: " + JSON.stringify(resultCreateIssues.data));

    if ("errors" in resultCreateIssues.data && resultCreateIssues.data.errors.length > 0) {
        throw { message: resultCreateIssues.data.errors };
    } else {
      // 3.1. Save the keys and ids of the issues (stories) created
      resultCreateIssues.data.issues.forEach((issueCreated, index) => {
        if (index !== resultCreateIssues.data.issues.length - 1) {
          groupObject[arrayGroupIssuesInfo[index]]["jiraID"] = issueCreated.id; // TODO, implement when the groups are working
          groupObject[arrayGroupIssuesInfo[index]]["jiraKey"] = issueCreated.key; // TODO, implement when the groups are working
        } else {
          // 3.2. The last issue correspond to the "Other steps" story. Save its id and key
          storyNoGroupSteps = {
            id: issueCreated.id,
            key: issueCreated.key
          };
        }
      });
      // return groupObject;
    }

    // 4. Organice the parameters to create the jira sub-tasks
    const resultOrganiceIssuesArrays = await createtIssuesArray(pddSteps, storyNoGroupSteps, groupObject, projectKey, accountName, component, userInfo)
    console.log("resultOrganiceIssuesArrays", JSON.stringify(resultOrganiceIssuesArrays))
    arrayIssuesAttach = resultOrganiceIssuesArrays.arrayIssuesAttach;

    // 5. Create the sub-tasks in Jira
    const resultCreateIIssues = await createIssueBulk(userInfo, resultOrganiceIssuesArrays.newIssueArrayCreation);
    logger.info("resultCreateIIssues: " + JSON.stringify(resultCreateIIssues.data));

    if (
      "errors" in resultCreateIIssues.data &&
      resultCreateIIssues.data.errors.length > 0
    ) {
      throw { message: resultCreateIIssues.data.errors };
    } else {
      arrayIssuesCreated = resultCreateIIssues.data.issues;

      for (let index = 0; index < arrayIssuesAttach.length; index++) {
        // 5.1. Add images as attachments on the issues
        const arrayNameFile = arrayIssuesAttach[index].keyImage.split("/");
        const nameFile = arrayNameFile[arrayNameFile.length - 1];
        const paramsGets3Obj = {
          Bucket: await parameterStore.getBucketName(),
          Key: arrayIssuesAttach[index].keyImage
        };
        const imageInfo = await s3Helper.getS3Object(paramsGets3Obj);
        const issueKey =
          arrayIssuesCreated[arrayIssuesAttach[index].index].key;

        const completePath = "/tmp/" + issueKey + "-" + nameFile;
        fs.writeFileSync("/tmp/" + issueKey + "-" + nameFile, imageInfo.Body);

        // const completePath = // To test local on Windows machine
        //   "C:\\Users\\camilo.ramirez\\Desktop\\" + issueKey + "-" + nameFile;
        // fs.writeFileSync(completePath, imageInfo.Body);

        const responseAddAttachment = await addAttachmentToIssue(
          userInfo,
          completePath,
          issueKey
        );

        logger.info("responseAddAttachment: " + JSON.stringify(responseAddAttachment.data));
      }

      return {
        message: "All issues were successfully created"
      };
    }
}

module.exports = {
    createProjectIssues
};
  