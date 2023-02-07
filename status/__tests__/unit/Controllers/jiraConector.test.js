import mockAxios from "axios"; 
const AWSMock = require('aws-sdk-mock');
const  { getAllSubtasksMetrics } = require("../../../Controllers/jiraConector");

const { resultStatusNoProyect, resultGetJiraInfo, resultStatusProyect } = require('../../../__mocks__/constants/jiraConector')
const { responseGetParameter } = require('../../../__mocks__/constants/ssmAWS')
const { responseGetCredentials } = require('../../../__mocks__/constants/dynamoAWS')

let countMockAWS = 0;

describe("Test 'getAllSubtasksMetrics':", () => {
    beforeAll(() => {
        process.env.DEPENDENCIES_TABLE_NAME="agilelive-dev-dependency";
        process.env.INTEGRATIONS_TABLE_NAME="agilelive-dev-integration";
        process.env.PDD_TABLE_NAME="agilelive-dev-documents";
        process.env.REGION="us-east-1";
        process.env.SERVICE_NAME="agilelive";
        process.env.STAGE="dev";

        AWSMock.mock('DynamoDB', 'getItem', function (params, callback) {
            console.log(":::::::::: getItem MOCK CALLED :::::::::::");
            callback(null, responseGetCredentials );
        });
        
        AWSMock.mock('SSM', 'getParameter', function (params, callback) {
            console.log(":::::::::: getParameter MOCK CALLED :::::::::::");
            callback(null, responseGetParameter);
        });
        
        mockAxios.get.mockImplementationOnce(() => //The mock of the axios module is modified only for its next use.
            Promise.resolve(resultGetJiraInfo) //Specific response for the use of the mocked request.
        );

    });
    afterAll(() => {
        AWSMock.restore('DynamoDB');
        AWSMock.restore('SSM');
    });  
    test('No key provided:', async () => {
        expect( await getAllSubtasksMetrics("", "0", true)).toBe(JSON.stringify(resultStatusNoProyect));
    })
    test('Key provided:', async () => {
        expect( await getAllSubtasksMetrics("N0D3E6", "0", true)).toBe(JSON.stringify(resultStatusProyect));
    })
 })
