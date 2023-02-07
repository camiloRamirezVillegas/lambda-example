require("dotenv").config();
require("babel-polyfill");
const { parameterStore } = require("../../../libs/parameterStore");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const logger = require('../../../libs/logger');

const stage = process.env.STAGE;

/**
 * Launch a bulk issue creation on Jira
 *
 * @export
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} issues Array of issue object to be created
 * @returns Jira information related to the issues created
 */
async function createIssueBulk(userInfo, issues) {
    try {
      const jira_api_url = await parameterStore.getJiraUrl();
  
      const tokenBase64 = Buffer.from(
        userInfo.email + ":" + userInfo.jiraApiToken
      ).toString("base64");
      const bodyData = {
        issueUpdates: issues
      };
      const config = {
        headers: {
          Authorization: "Basic " + tokenBase64,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      };
  
      logger.info("------------------------------Create Issue Bulk-----------------------------");
      logger.info("Config Create Issue Bulk : " + JSON.stringify(config));
      logger.info("Body Create Issue Bulk : " + JSON.stringify(bodyData));
      logger.info("URL Create Issue Bulk : " + jira_api_url + "/issue/bulk");
  
      return axios
        .post(jira_api_url + "/issue/bulk", JSON.stringify(bodyData), config)
        .then(response => {
          logger.info("------------------------------Create Issue Bulk-----------------------------");
          logger.info("Response Create Issue Bulk : " + JSON.stringify(response.data));
          return response;
        })
        .catch(error => {
          if (
            "errorMessages" in error.response.data &&
            error.response.data.errorMessages
          ) {
            throw { message: error.response.data.errorMessages };
          } else if (
            "errors" in error.response.data &&
            error.response.data.errors
          ) {
            throw { message: error.response.data.errors };
          }
        });
    } catch (error) {
      throw error;
    }
}
  
  async function addAttachmentToIssue(userInfo, pathFile, issueKey) {
    try {
      const jira_api_url = await parameterStore.getJiraUrl();
      const fileUpload = fs.createReadStream(pathFile);
      
      let bodyFormData = new FormData();
      bodyFormData.append("file", fileUpload);
      const tokenBase64 = Buffer.from(
        userInfo.email + ":" + userInfo.jiraApiToken
      ).toString("base64");
      const dispositionHeader =
        'form-data; name="file"; filename="' + pathFile + '"';
      const url = jira_api_url + "/issue/" + issueKey + "/attachments";
  
      const config = {
        headers: {
          Authorization: "Basic " + tokenBase64,
          "Content-Type":
            "multipart/form-data; boundary=" + bodyFormData._boundary,
          "X-Atlassian-Token": "no-check",
          "Content-Disposition": dispositionHeader
        }
      };
  
      logger.info("------------------------------Add attachement to Issue-----------------------------");
      logger.info("Config Add attachement to Issue : " + JSON.stringify(config));
      logger.info("Body Add attachement to Issue : " + JSON.stringify(bodyFormData));
      logger.info("URL Add attachement to Issue : " + url);
  
      return axios
        .post(url, bodyFormData, config)
        .then(response => {
          fs.unlinkSync(pathFile);
          logger.info("------------------------------Add attachement to Issue2-----------------------------");
          logger.info("Response Add attachement to Issue : " + JSON.stringify(response.data));
          return response;
        })
        .catch(error => {
          throw error;
        });
    } catch (error) {
      throw error;
    }
}


/**
 * Launch a component creation on Jira
 *
 * @export
 * @param {*} userInfo Database information related to the user that launch the initial configuration of the Jira account
 * @param {*} projectKey Project key
 * @returns Jira information related to the component created
 */
async function createComponent(userInfo, projectKey) {
  try {
    const jira_api_url = await parameterStore.getJiraUrl();

    const tokenBase64 = Buffer.from(
      userInfo.email + ":" + userInfo.jiraApiToken
    ).toString("base64");
    const bodyData = {
      name: stage + "-Robotinuum Studio populated",
      description: "Component to group all the issues created automatically in the Robotinuum Studio process population",
      leadUserName: userInfo.email,
      assigneeType: "UNASSIGNED",
      isAssigneeTypeValid: false,
      project: projectKey
    };
    const config = {
      headers: {
        Authorization: "Basic " + tokenBase64,
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    };
    logger.info("------------------------------Create Component-----------------------------");
    logger.info("Config Create Component : " + JSON.stringify(config));
    logger.info("Body Create Component : " + JSON.stringify(bodyData));
    logger.info("URL Create Component : " + jira_api_url + "/component");
    
    return axios.post(jira_api_url + "/component", JSON.stringify(bodyData), config)
  } catch (error) {
    throw error;
  }
}

module.exports = {
    createIssueBulk,
    addAttachmentToIssue,
    createComponent
};