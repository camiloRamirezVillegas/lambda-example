const AWSMock = require('aws-sdk-mock');
const  { createtIssuesArray } = require("../../../Controllers/issueCreation");
const { groupObject, inputPddSteps, responseFunc, userInfo, storyNoGroupSteps } = require('../../../__mocks__/constants/issueCreation')

describe("Test 'createtIssuesArray':", () => {
    test('No component provided:', async () => {
        expect( await createtIssuesArray(inputPddSteps, storyNoGroupSteps, groupObject, "N0D3E6", "dapi", null, userInfo)).toMatchObject(responseFunc);
    })
})
