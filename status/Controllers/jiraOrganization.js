const { createProject, getProject } = require("../Helpers/jiraHelper");
const { createComponent } = require("../Helpers/jiraIssuesHelper");
const uuid = require("uuid");
const logger = require('../../../libs/logger');

/**
 * Organice the Jira integration information, in order to be used to create the Jira project and a component to be used on the issues creation
 *
 * @param {*} resultRetrieveJiraIntegration Dynamo integration info
 * @param {*} userInfo Integration info object
 * @param {*} event Lambda invocation event
 * @param {*} process Process object
 * @param {*} accountName Define the client in which the application is deployed
 * @returns
 */
async function retrieveJiraComponentandProject(resultRetrieveJiraIntegration, userInfo, event, process, accountName) {    
    if (resultRetrieveJiraIntegration.Item != undefined) {
        userInfo["email"] = resultRetrieveJiraIntegration.Item.username.S;
        userInfo["jiraApiToken"] = resultRetrieveJiraIntegration.Item.token.S;
        if ("projectCategoryID" in resultRetrieveJiraIntegration.Item) {
            userInfo["projectCategoryID"] =
            resultRetrieveJiraIntegration.Item.projectCategoryID.S;
            if ("projectRoleID" in resultRetrieveJiraIntegration.Item) {
                userInfo["projectRoleID"] =
                resultRetrieveJiraIntegration.Item.projectRoleID.S;
                if ("permissionSchemeID" in resultRetrieveJiraIntegration.Item) {
                    userInfo["permissionSchemeID"] =
                    resultRetrieveJiraIntegration.Item.permissionSchemeID.S;
                    if ("accountId" in resultRetrieveJiraIntegration.Item) {
                        userInfo["accountId"] =
                        resultRetrieveJiraIntegration.Item.accountId.S;
                        if ("storyId" in resultRetrieveJiraIntegration.Item) {
                            userInfo["storyId"] =
                            resultRetrieveJiraIntegration.Item.storyId.S;
                            if ("subTaskId" in resultRetrieveJiraIntegration.Item) {
                                userInfo["subTaskId"] =
                                resultRetrieveJiraIntegration.Item.subTaskId.S;

                                // 1. Create the project key.
                                const random = uuid.v4();
                                const keyProcessName = process.info.name
                                    .split(" ")
                                    .map(word => word[0])
                                    .join("");
                                const keyProject = (`${keyProcessName.substring(0, 5)}${random.substring(0, 5)}`).replace(/\W/g, "").toUpperCase();
                                // const keyProject = "N0D3E6"; //TODO, qwuitar
                                logger.info("keyProject: " + keyProject)

                                // 2. Create the project.
                                try { // TODO, this request should not fail when creating the project
                                    const resultCreateProject = await createProject(userInfo, event.pddVersion, process, accountName, keyProject); 
                                    logger.info("result create project: " + JSON.stringify(resultCreateProject))
                                }
                                catch (error){
                                    logger.error("-------------------ERROR----------------------")
                                    logger.error("Error create project: " + JSON.stringify(error.response.data))
                                    
                                    if(error.response.status !== 500){
                                        return (error.response.data) // TODO, esto debería ser un throw
                                    }
                                }
                                
                                // 2.1. Get the project information. // This should not be necessary if the request of project creation work as expected 
                                const jiraProjectInfo = await getProject(userInfo, keyProject); 
                                logger.info("jiraProjectInfo: " + JSON.stringify(jiraProjectInfo.data))

                                // 3. Create jira component (only for PwC).
                                let resultCreateComponent = null
                                if (accountName === 'pwc'){
                                    resultCreateComponent = await createComponent(userInfo, jiraProjectInfo.data.key)
                                    logger.info("result create component : " + JSON.stringify(resultCreateComponent.data))
                                }

                                return {
                                    resultCreateProject: jiraProjectInfo.data,
                                    resultCreateComponent,
                                    userInfo
                                } 
                            } else
                            throw {
                                message:
                                "Could not retrieve the subTaskId id from the jira integration information"
                            };        
                        } else
                        throw {
                            message:
                            "Could not retrieve the storyId id from the jira integration information"
                        };
                    } else
                    throw {
                        message:
                        "Could not retrieve the account id from the jira integration information"
                    };
                } else
                    throw {
                    message:
                        "Could not retrieve the permission scheme id from the jira integration information"
                    };
            } else
            throw {
                message:
                "Could not retrieve the project role id from the jira integration information"
            };
        } else
            throw {
            message:
                "Could not retrieve the project category id from the jira integration information"
            };
    } else {
    throw { message: "No integration with Jira was detected" };
    }

}

module.exports = {
    retrieveJiraComponentandProject
};