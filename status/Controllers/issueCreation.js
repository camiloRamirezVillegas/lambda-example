const logger = require('../../../libs/logger');
require("babel-polyfill");
const uuid = require("uuid");

/**
 * Create the arrays necessaries to create the Jira project issues
 *
 * @param {*} pddSteps Array of steps retrieved from dynamoDB
 * @param {*} storyNoGroupSteps Information of the issue (Story) ceraated to host the no group related sub-tasks 
 * @param {*} groupObject Object that contains the information of the groups created in the Pdd 
 * @param {*} projectKey Jira project key
 * @param {*} accountName Client name
 * @returns Object of arrays with the information to create the sub-tasks
 */
async function createtIssuesArray(pddSteps, storyNoGroupSteps, groupObject, projectKey, accountName, component, userInfo) {
    let newIssueArrayCreation = [];
    let arrayIssuesAttach = [];

    logger.info("storyNoGroupSteps : " + JSON.stringify(storyNoGroupSteps))
    // 6. Iterate over the steps to create the new issues objects.
    pddSteps.forEach((step, index) => {
    if ("onImage" in step && step.onImage !== " ") {
        arrayIssuesAttach.push({
        index: index,
        keyImage: step.onImage
        });
    }
    if ("doImage" in step && step.doImage !== " ") {
        arrayIssuesAttach.push({
        index: index,
        keyImage: step.doImage
        });
    }

    let newSubTask = {};

    // 7. If the steps are related to a group  // TODO, fix with new groups
    if (
        "subProcess" in step &&
        step.subProcess &&
        step.subProcess !== "undefined" &&
        step.subProcess in groupObject // TODO, implement when the groups are working
    ) {
        newSubTask = {
        fields: {
            project: {
            key: projectKey
            },
            description: `On system: ${step.onSystem}
        On detail: ${step.onDetail}
        When: ${step.whenAction}
        Do action: ${step.doAction}
        Do detail: ${step.doDetail}`,
            summary: `${step.name ? step.name : uuid.v4()}`,
            issuetype: {
            id: userInfo.subTaskId
            },
            parent: {
            key: groupObject[step.subProcess].jiraKey
            }
        }
        };
        if(accountName === 'pwc'){
        newSubTask['fields']['customfield_11100'] = "Default acceptance criteria";
        newSubTask['fields']['components'] = [{
            id: component.id
        }];
        }
        newIssueArrayCreation.push(newSubTask);
    }
    // 8. If the steps are not related to a group
    else {
        if(step.SK.includes("step")){
        newSubTask = {
            fields: {
            project: {
                key: projectKey
            },
            description: `On system: ${step.onSystem}
            On detail: ${step.onDetail}
            When: ${step.whenAction}
            Do action: ${step.doAction}
            Do detail: ${step.doDetail}`,
            summary: `${step.name ? step.name : uuid.v4()}`,
            issuetype: {
                id: userInfo.subTaskId
            },
            parent: {
                key: storyNoGroupSteps.key
            }
            }
        };
        if(accountName === 'pwc'){
            newSubTask['fields']['customfield_11100'] = "Default acceptance criteria";
            newSubTask['fields']['components'] = [{
            id: component.id
            }];
        }
        newIssueArrayCreation.push(newSubTask);
        }
    }
    })
    return {
        newIssueArrayCreation,
        arrayIssuesAttach
    }
}

module.exports = {
    createtIssuesArray
};
  