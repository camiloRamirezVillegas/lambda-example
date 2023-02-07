require("dotenv").config();
const {
  getJiraUserbyEmail,
  addUsertoProjectRole
} = require("../Helpers/jiraHelper");
const lambdaHelper = require("./../../../libs/lambdaHelper");
const { getItem } = require ("./../../../libs/dbbHelper")
const { createProjectIssues } = require("./jiraIssueController");
const { retrieveJiraComponentandProject } = require("./jiraOrganization");
const { parameterStore } = require ("./../../../libs/parameterStore")
const { getInfo, patchMongo } = require ("./../../../libs/dbMongoHelper")
const logger = require('../../../libs/logger');

const stageEnv = process.env.STAGE;

async function createJiraProject(event) {
  let userInfo = {};
  let jiraProject = {};
  let componentCreated = null;

  try {
    const accountName = await parameterStore.getAccountName();
    logger.info("accountName : " + accountName)

    if ('company' in event && 'process' in event && 'pddVersion' in event) {
      logger.info("Start Jira Project Creation");
      
      // 0. Retrieve the process information.
      const processInfo = await getInfo("process", event.process, "", event.headers.tenant)
      logger.info("Process retrieved : " + JSON.stringify(processInfo.data))
  
      // 1. Retrieve the jiraIntegration information.
      const paramsGetIntagration = {
        TableName: process.env.INTEGRATIONS_TABLE_NAME,
        Key: {
          PK: { S: "jira#" + event.headers.tenant + "#" + event.company }
        }
      };
      console.log("Get Jira integration params: ", paramsGetIntagration)
      const jiraIntegration = await getItem(paramsGetIntagration)
      logger.info("jiraIntegration: " + JSON.stringify(jiraIntegration))
  
      // 2. Create the jira project and component.
      const jiraComponentProject = await retrieveJiraComponentandProject(jiraIntegration, userInfo, event, processInfo.data, accountName)
      logger.info("jiraComponentProject: " + JSON.stringify(jiraComponentProject))
      if('errors' in jiraComponentProject){
        throw jiraComponentProject.errors
      }
  
      jiraProject["id"] = jiraComponentProject.resultCreateProject.id;
      jiraProject["key"] = jiraComponentProject.resultCreateProject.key;
      componentCreated = jiraComponentProject.resultCreateComponent ? jiraComponentProject.resultCreateComponent.data : null;
      userInfo = jiraComponentProject.userInfo;
  
      // 3. Create a query string that will be used to filter a request to the user
      const queryStringPopulateUsers = processInfo.data.developers.length != 0 ? "?filterby=" + encodeURIComponent(
        JSON.stringify(
          {
            _id: processInfo.data.developers.map(developerUserRole => {
              return developerUserRole.user
            })
          }
        )
      ) : "?filterby=%7B%22_id%22%3A%5B%5D%7D"; // Empty encoded user array
      logger.info("Query params filter users from process : " + JSON.stringify(queryStringPopulateUsers))
  
      // 3. Retrieve the users completed populated 
      const usersPopulated = await getInfo("user", "", queryStringPopulateUsers, event.headers.tenant);
      logger.info("usersPopulated: " + JSON.stringify(usersPopulated.data))
        
      // 4. Get the jira user information
      const resultGetJiraUser = await getJiraUserbyEmail(userInfo, userInfo.email, accountName)
      logger.info("resultGetJiraUser: " + JSON.stringify(resultGetJiraUser.data))
  
      // 5. Add the developers to jira project
      await Promise.all(usersPopulated.data.items.map(async developer => {
        logger.info("-----------------------------------------------------")
        const jiraUserInfo = await getJiraUserbyEmail(userInfo, developer.info.email, accountName);
        logger.info("Developer - " + developer.info.email + ": " + JSON.stringify(jiraUserInfo.data));

        if (jiraUserInfo.data.length > 0) {
          const resultAddUser = await addUsertoProjectRole(
            userInfo,
            jiraProject.key,
            accountName === 'dapi' ? result.data[0].accountId : result.data[0].name
          );
          logger.info("resultAddUser: " + JSON.stringify(resultAddUser))
            
        } else {
          logger.info( "The user " + developer.info.email + " doesn't exists in JIRA");
        }
      }));
  
      // 5. Assign the project role configured in the Jira initialization to the user consulted previously (The project creator)
      const resultAddDeveloper =  await addUsertoProjectRole(
        userInfo,
        jiraProject.key,
        accountName === 'dapi' ? resultGetJiraUser.data[0].accountId : objectResponse.resultGetJiraUser[0].name 
      );
      logger.info("resultAddDeveloper: " + JSON.stringify(resultAddDeveloper.data))
  
      // 6. Save the Jira project key into the Mongo database
      const resultMongoUpdate = await patchMongo("process", processInfo.data._id, "", event.headers.tenant, {jiraID: jiraProject.key});
      logger.info("resultMongoUpdate: " + JSON.stringify(resultMongoUpdate.data))
  
      
      // 7. Create the issues in the Jira project
      const resultCreateIssues = await createProjectIssues(userInfo, event, jiraProject.key, componentCreated, accountName);
      logger.info("resultCreateIssues: " + JSON.stringify(resultCreateIssues))
    
      // 8. Create the jira notification
      let invokeNotifications = await lambdaHelper.invokeLambdaFunction(
        "agilelive-" + stageEnv + "-notifications-service",
        {
          invokeFunction: true,
          processId: processInfo.data._id,
          tenant: event.headers.tenant,
          type: 'success'
        }
      );
      logger.info("InvokeNotificationsResult: " + JSON.stringify(invokeNotifications));
      
      // 9. Return the success message
      return resultCreateIssues;
  
    } else {
      throw { message: "No suitable event to create the Jira project" }
    }
  }
  catch (error){
    // // Error. Create the jira notification of the error in the project creation
    let invokeNotifications = await lambdaHelper.invokeLambdaFunction(
      "agilelive-" + stageEnv + "-notifications-service",
      {
        invokeFunction: true,
        processId: event.process,
        tenant: event.headers.tenant,
        type: 'error'
      }
    );
    logger.error("InvokeNotificationsResult: " + JSON.stringify(invokeNotifications));
    throw { message: 'message' in error ? error.message : JSON.stringify(error) }
  }
}

/**
 * This function its called in an asynchronous way, so the user can have a fast response from the jira population process that can take a few minutes
 *
 * @param {*} event Original event, that will be retransmited to another lambda call
 * 
 * @returns
 */
async function createJiraProjectAsync(event) {
  logger.info("Redirecting jira process population to the back end")
  if('scope' in event && event.scope === 'createJiraProjectAsync'){
    event.scope = "createJiraProject"
  }

  return lambdaHelper.invokeLambdaFunction(
    "agilelive-" + stageEnv + "-status-service", event
  );
}

module.exports = {
  createJiraProject,
  createJiraProjectAsync,
};
