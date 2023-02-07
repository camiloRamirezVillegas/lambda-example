"use strict";
require("dotenv").config();
import "babel-polyfill";
const jiraConector = require("./Controllers/jiraConector"); //Used in the no handler example.
const jiraController = require("./Controllers/jiraController"); //Used in the no handler example.
const logger = require('../../libs/logger');

/**
 * Main handler
 */
export const handler = async (event) => {
  logger.info("Event : " + JSON.stringify(event));
  let responseLambda = { statusCode: 501, body: "" };

  try {
    if (event.httpMethod === "POST") {
      event = "path" in event ? JSON.parse(event.body) : event;

      if (event.scope === "getProcessStatus") {
        if('headers' in event && 'tenant' in event.headers && event.headers.tenant){
          const jiraProjectStatus =  await jiraConector.getAllSubtasksMetrics(event.key, event.clientId, true, event.headers.tenant);
          logger.info("Jira project status: " + JSON.stringify(jiraProjectStatus))
          responseLambda.body = jiraProjectStatus;
          responseLambda.statusCode = 200
        } else {
          responseLambda.body = "No tenant provided";
          responseLambda.statusCode = 400
        }
      } else if (event.scope === "createJiraProject") {
        const resultCreateJira = await jiraController.createJiraProject(event)
        logger.info("Index create Jira project: " + JSON.stringify(resultCreateJira))
        responseLambda.body = JSON.stringify(resultCreateJira);
        responseLambda.statusCode = 200
      } 
      else if (event.scope === "createJiraProjectAsync") {
        const resultCreateJiraAsync = await jiraController.createJiraProjectAsync(event);
        responseLambda.body = JSON.stringify(resultCreateJiraAsync);
        responseLambda.statusCode = 200
      }
      else {
        const message = "No valid scope provided";
        logger.error(message);
        responseLambda.body = message;
      }
    } 
    else {
      const message = "No valid httpMethod provided";
      logger.error(message);
      responseLambda.body = message;
    }
  } catch (error) {
    logger.error("Error in index: " + JSON.stringify(error));
    responseLambda.body = 'message' in error ? error.message : JSON.stringify(error);
  } finally {
    logger.info("------------END-----------", responseLambda);
    return responseLambda;
  }
};
