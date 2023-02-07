import mockAxios from "axios"; 
// import mockAxios from "fs"; 
const AWSMock = require('aws-sdk-mock');
const  { createIssueBulk, addAttachmentToIssue } = require("../../../Helpers/jiraIssuesHelper");

const { userInfo } = require('../../../__mocks__/constants/issueCreation')
const { issuesArray, responseCreateIssuesArray, responseAddAttachement } = require('../../../__mocks__/constants/jiraIssuesHelper')
const { responseGetParameter } = require('../../../__mocks__/constants/ssmAWS')

const fs = require('fs');
jest.mock('fs') // this auto mocks all methods on fs - so you can treat fs.existsSync and fs.mkdirSync like you would jest.fn()

// let spy = null;

describe("Test 'createIssueBulk':", () => {
    beforeAll(() => {
        process.env.DEPENDENCIES_TABLE_NAME="agilelive-dev-dependency";
        process.env.INTEGRATIONS_TABLE_NAME="agilelive-dev-integration";
        process.env.PDD_TABLE_NAME="agilelive-dev-documents";
        process.env.REGION="us-east-1";
        process.env.SERVICE_NAME="agilelive";
        process.env.STAGE="dev";
    
        AWSMock.mock('SSM', 'getParameter', function (params, callback) {
            console.log(":::::::::: getParameter MOCK CALLED :::::::::::");
            callback(null, responseGetParameter);
        });
        
        mockAxios.post.mockImplementationOnce(() => //The mock of the axios module is modified only for its next use.
            Promise.resolve(responseCreateIssuesArray) //Specific response for the use of the mocked request.
        );
    });
    afterAll(() => {
        AWSMock.restore('SSM');
    });  
    test('No key provided:', async () => {
        expect( await createIssueBulk(userInfo, issuesArray)).toMatchObject(responseCreateIssuesArray); // TODO, poner evaluaciones que relacionen ese input con la salida, ahora como esta solo importa el mock de la respuesta del post
    })
 })

describe("Test 'addAttachmentToIssue':", () => {
    beforeAll(() => {
        process.env.DEPENDENCIES_TABLE_NAME="agilelive-dev-dependency";
        process.env.INTEGRATIONS_TABLE_NAME="agilelive-dev-integration";
        process.env.PDD_TABLE_NAME="agilelive-dev-documents";
        process.env.REGION="us-east-1";
        process.env.SERVICE_NAME="agilelive";
        process.env.STAGE="dev";

        AWSMock.mock('SSM', 'getParameter', function (params, callback) {
            console.log(":::::::::: getParameter MOCK CALLED :::::::::::");
            callback(null, responseGetParameter);
        });
        
        mockAxios.post.mockImplementationOnce(() => //The mock of the axios module is modified only for its next use.
            Promise.resolve(responseAddAttachement) //Specific response for the use of the mocked request.
        );

        fs.createReadStream.mockReturnValue(true);
    });
    afterAll(() => {
        AWSMock.restore('SSM');
        spy.mockRestore();
    });

    test('No key provided:', async () => {
        expect( await addAttachmentToIssue(userInfo, "/tmp/N0D3E6-3-on.jpg", "N0D3E6-3")).toMatchObject(responseAddAttachement); // TODO, poner evaluaciones que relacionen ese input con la salida, ahora como esta solo importa el mock de la respuesta del post
    })
})