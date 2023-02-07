export const inputPddSteps = [
    {"doAction":"a11","doDetail":" d11","transcription":" ","name":"st1","stepTranscription":" ","transcriptionStatus":"unavailable","onDetail":" d1","subProcess":" ","SK":"#pdd-1.0#step-0cjj9cs","onImage":"pdd-steps-image/0cjj9cs/on.jpg","onSystem":" ","PK":"5f18a46a5f3dca0008c00406","whenAction":" t1","doImage":"pdd-steps-image/0cjj9cs/do.jpg"},
    {"doAction":" a33","doDetail":" d33","transcription":" ","name":"s3","stepTranscription":" ","transcriptionStatus":"unavailable","onDetail":" d3","subProcess":"subProcess-1k7qf0d","SK":"#pdd-1.0#step-11ki8qb","onImage":"pdd-steps-image/11ki8qb/on.jpg","onSystem":" ","PK":"5f18a46a5f3dca0008c00406","whenAction":" t3","doImage":"pdd-steps-image/11ki8qb/do.jpg"},
    {"doAction":"a22","doDetail":" d22","transcription":" ","name":"st2","stepTranscription":" ","transcriptionStatus":"unavailable","onDetail":" d2","subProcess":" ","SK":"#pdd-1.0#step-1oz55xe","onImage":"pdd-steps-image/1oz55xe/on.jpg","onSystem":" ","PK":"5f18a46a5f3dca0008c00406","whenAction":" t22","doImage":" "},
    {"estimationType":"","moduleId":" ","jiraStory":" JIRASUB1","SK":"#pdd-1.0#subProcess-1k7qf0d","moduleName":" ","description":" description Jira subprocess 1","PK":"5f18a46a5f3dca0008c00406","name":"SB1"}
];

export const groupObject = {
    "subProcess-1k7qf0d":{"name":"SB1","tasks":[],"jiraID":"10111","jiraKey":"N0D3E6-1"}
};

export const userInfo = {
    "email":"jsolarte@choiceworx.com",
    "jiraApiToken":"tokenJira",
    "projectCategoryID":"10001",
    "projectRoleID":"10005",
    "permissionSchemeID":"10002",
    "accountId":"5ec31534dd6b750c2260961a",
    "storyId":"10001",
    "subTaskId":"10003"
};

export const storyNoGroupSteps = {"id":"10112","key":"N0D3E6-2"};

export const responseFunc = {
    "newIssueArrayCreation":[
        {"fields":{"project":{"key":"N0D3E6"},"description":"On system:  \n            On detail:  d1\n            When:  t1\n            Do action: a11\n            Do detail:  d11","summary":"st1 : a11","issuetype":{"id":"10003"},"parent":{"key":"N0D3E6-2"}}},
        {"fields":{"project":{"key":"N0D3E6"},"description":"On system:  \n        On detail:  d3\n        When:  t3\n        Do action:  a33\n        Do detail:  d33","summary":"s3 :  a33","issuetype":{"id":"10003"},"parent":{"key":"N0D3E6-1"}}},
        {"fields":{"project":{"key":"N0D3E6"},"description":"On system:  \n            On detail:  d2\n            When:  t22\n            Do action: a22\n            Do detail:  d22","summary":"st2 : a22","issuetype":{"id":"10003"},"parent":{"key":"N0D3E6-2"}}}
    ],
    "arrayIssuesAttach":[
        {"index":0,"keyImage":"pdd-steps-image/0cjj9cs/on.jpg"},
        {"index":0,"keyImage":"pdd-steps-image/0cjj9cs/do.jpg"},
        {"index":1,"keyImage":"pdd-steps-image/11ki8qb/on.jpg"},
        {"index":1,"keyImage":"pdd-steps-image/11ki8qb/do.jpg"},
        {"index":2,"keyImage":"pdd-steps-image/1oz55xe/on.jpg"}
    ]
};