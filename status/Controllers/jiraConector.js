require("dotenv").config();
const { getItem } = require("../../../libs/dbbHelper");
const axios = require("axios");
const { parameterStore } = require("../../../libs/parameterStore");
const logger = require('../../../libs/logger');

/**
 * This function retrieve the jira information after get the log information from the integrations database
 * @param {*} key
 * @param {*} clientId
 * @param {*} resume
 */
async function getAllSubtasksMetrics(key, clientId, resume, tenant) {
  const jira_api_url = await parameterStore.getJiraUrl();
  logger.info("jira_api_url: ", jira_api_url)

  if (key === "" || key === undefined || key === "undefined" && !tenant) {
    return JSON.stringify({
      progress: -1,
      toDoSubtasks: -1,
      inProgressSubtasks: -1,
      doneSubtasks: -1
    });
  } else {
    // Variables to define the scope of the GET function
    let startAt = 0;
    let maxResults = 100;

    //Variables initialization for the while
    const params = {
      TableName: process.env.INTEGRATIONS_TABLE_NAME,
      Key: {
        PK: { S: "jira#" + tenant + "#" + clientId }
      }
    };
    let credentials = await getItem(params);

    let jql = `project = "${key}" AND issuetype = Sub-task`;
    let pending = true;
    let arrayIssues = [];

    // Loop to get all the Stories in a Array.
    // Pd. JIRA establish a restriction to bring only 100 issues per each GET
    while (pending) {
      try {
        const config = {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(
                credentials.Item.username.S + ":" + credentials.Item.token.S
              ).toString("base64"),
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          params: {
            jql,
            fields: "issuetype,key,status,progress,parent",
            maxResults,
            startAt
          }
        };

        logger.info("................JIRA GET.................");
        logger.info("URL : " + jira_api_url + "/search");
        logger.info("CONFIG : " + JSON.stringify(config));

        const result = await axios.get(
          jira_api_url + "/search",
          config
        );

        logger.info("Result Jira Issues : " + JSON.stringify(result.data));
        // logger.info("Result Jira Issues : " + JSON.stringify(result.data.issues));

        arrayIssues = arrayIssues.concat(result.data.issues);
        const total = result.data.total;
        startAt += maxResults;
        pending = startAt < total;
      } catch (error) {
        logger.error("error: " + error);
        arrayIssues = null;
      }
      pending = false;
    }
    //Variables to store the amount of hours depending of the status
    let subtaskTotalHours = 0;
    let subtaskTotalToDoHours = 0;
    let subtaskTotalInProgressHours = 0;
    let subtaskTotalDoneHours = 0;

    let toDoSubtasks = 0;
    let inProgressSubtasks = 0;
    let doneSubtasks = 0;

    let subTaskProgress = 0;
    let subTaskTotal = 0;

    //Loop to go over each Story and store the amount of hours
    if (arrayIssues) {
      arrayIssues.forEach(issue => {
        subtaskTotalHours += issue.fields.progress.total;

        if (
          issue.fields.status.name == "To Do" ||
          issue.fields.status.name == "Tareas por hacer"
        ) {
          subtaskTotalToDoHours += issue.fields.progress.total;
          toDoSubtasks += 1;
        }
        if (
          issue.fields.status.name == "In Progress" ||
          issue.fields.status.name == "En curso"
        ) {
          subtaskTotalInProgressHours += issue.fields.progress.total;
          inProgressSubtasks += 1;
        }
        if (
          issue.fields.status.name == "Done" ||
          issue.fields.status.name == "Finalizada"
        ) {
          subtaskTotalDoneHours += issue.fields.progress.total;
          doneSubtasks += 1;
        }
      });
      // Variable to calculate the Progress in percentaje

      let progress = (subtaskTotalDoneHours * 100) / subtaskTotalHours;
      progress = isNaN(progress) ? 0 : parseInt(progress.toFixed(0));

      // let toDoHours = subtaskTotalToDoHours/3600;
      // let inProgressHours = subtaskTotalInProgressHours/3600;
      // let doneHours = subtaskTotalDoneHours/3600;
      //return {subtaskTotalHours, subtaskTotalToDoHours, subtaskTotalInProgressHours, subtaskTotalDoneHours}
      logger.info(
        "For project " +
          key +
          " status: " +
          JSON.stringify({
            progress,
            toDoSubtasks,
            inProgressSubtasks,
            doneSubtasks
          })
      );

      if (resume) {
        return JSON.stringify({
          progress,
          toDoSubtasks,
          inProgressSubtasks,
          doneSubtasks
        });
      } else {
        return arrayIssues;
      }
    } else {
      return JSON.stringify({
        progress: -1,
        toDoSubtasks: -1,
        inProgressSubtasks: -1,
        doneSubtasks: -1
      });
    }
  }
}

module.exports = {
  getAllSubtasksMetrics,
};
