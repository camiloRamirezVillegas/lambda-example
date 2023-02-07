require("dotenv").config();
require("babel-polyfill");
const { parameterStore } = require("../../../libs/parameterStore");
const axios = require("axios");
const logger = require('../../../libs/logger');

/**
 * Create a project in Jira
 *
 * @export
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} namePDD Name of the PDD
 * @param {*} process Process information related to the PDD used to create the project
 * @returns Jira information of the created project
 */
async function createProject(userInfo, namePDD, process, accountName, keyProject) {
  const jira_api_url = await parameterStore.getJiraUrl();

  const tokenBase64 = Buffer.from(
    userInfo.email + ":" + userInfo.jiraApiToken
  ).toString("base64");
  // const keyProcessName = process.info.name
  //   .split(" ")
  //   .map(word => word[0])
  //   .join("");
  // const keyProject = `${keyProcessName.substring(0, 5)}${random.substring(0, 5)}`;

  let bodyData = {
    description: `This project will be used in the development of the bot for the process "${process.info.name}", according to the pdd: "${namePDD}`,
    projectTemplateKey: "com.pyxis.greenhopper.jira:gh-simplified-scrum-classic",
    // projectTemplateKey: "com.pyxis.greenhopper.jira:gh-scrum-template",
    name: `${process.info.name} - ${namePDD}`,
    assigneeType: "UNASSIGNED",
    projectTypeKey: "software",
    key: keyProject,
    categoryId: userInfo.projectCategoryID,
    avatarId: "10200",
    permissionScheme: userInfo.permissionSchemeID,
    notificationScheme: "10000"
  };

  if (accountName === 'dapi') {
    bodyData['leadAccountId'] = userInfo.accountId;
    // bodyData['issueSecurityScheme'] = "10000";

  } else if (accountName === 'pwc') {
    bodyData['lead'] = userInfo.accountId;
    bodyData['issueSecurityScheme'] = "10100";
  }

  const config = {
    headers: {
      Authorization: "Basic " + tokenBase64,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };

  logger.info("------------------------------Create Jira Project-----------------------------");
  logger.info("Body Create Jira Project : " + JSON.stringify(bodyData));
  logger.info("Config Create Jira Project : " + JSON.stringify(config));
  logger.info("URL Create Jira Project : " + jira_api_url + "/project");

  return axios.post(jira_api_url + "/project", JSON.stringify(bodyData), config)
}

/**
 * Retrieve the Jira information of an user by its email
 *
 * @export
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} emailToSearch Email to search in the jira user list
 * @param {*} accountName Client name
 * @returns
 */
async function getJiraUserbyEmail(userInfo, emailToSearch, accountName) {
  try {
    const jira_api_url = await parameterStore.getJiraUrl();

    const tokenBase64 = Buffer.from(
      userInfo.email + ":" + userInfo.jiraApiToken
    ).toString("base64");
    let config = {
      headers: {
        Authorization: "Basic " + tokenBase64,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    if (accountName === "dapi"){
      config['params'] = {
        query: emailToSearch,
      };
    }
    else if (accountName === "pwc"){
      config['params'] = {
        username: emailToSearch,
      };
    }

    logger.info("------------------------------Get User by Email-----------------------------");
    logger.info("Config Get User by Email : " + JSON.stringify(config));
    logger.info("URL Get User by Email : " + jira_api_url + "/user/search");

    return axios.get(jira_api_url + "/user/search", config)
  } catch (error) {
    throw error;
  }
}

/**
 * Associate a Jira user to a project role in the project specified
 *
 * @export
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} projectKey Jira key related to the project
 * @param {*} userName Jira username of the user to be associated with the project role
 * @returns Confirmation message
 */
async function addUsertoProjectRole(userInfo, projectKey, userName) {
  try {
    const jira_api_url = await parameterStore.getJiraUrl();

    const tokenBase64 = Buffer.from(
      userInfo.email + ":" + userInfo.jiraApiToken
    ).toString("base64");
    const config = {
      headers: {
        Authorization: "Basic " + tokenBase64,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };
    const body = {
      user: [userName]
    };

    logger.info("------------------------------Add user to project-----------------------------");
    logger.info("Config Add user to project : " + JSON.stringify(config));
    logger.info("Body Add user to project : " + JSON.stringify(body));
    logger.info("URL Add user to project : " + jira_api_url + `/project/${projectKey}/role/${userInfo.projectRoleID}`);

    return axios
      .post(
        jira_api_url + `/project/${projectKey}/role/${userInfo.projectRoleID}`,
        body,
        config
      )
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve the information of a Jira project
 *
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} projectKey Jira project unic key
 * @returns
 */
async function getProject(userInfo, projectKey) {
  try {
    const jira_api_url = await parameterStore.getJiraUrl();
    const tokenBase64 = Buffer.from(
      userInfo.email + ":" + userInfo.jiraApiToken
    ).toString("base64");
    const config = {
      headers: {
        Authorization: "Basic " + tokenBase64,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };

    logger.info("------------------------------Get Project Info-----------------------------");
    logger.info("Config Add user to project : " + JSON.stringify(config));
    logger.info("URL get project info : " + jira_api_url + `/project/${projectKey}`);

    return axios
      .get(
        jira_api_url + `/project/${projectKey}`,
        config
      )
  } catch (error) {
    throw error;
  }
}


module.exports = {
  createProject,
  getJiraUserbyEmail,
  addUsertoProjectRole,
  getProject
};
