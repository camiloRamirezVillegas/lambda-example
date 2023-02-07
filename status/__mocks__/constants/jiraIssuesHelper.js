export const issuesArray = [
    {"fields":{"project":{"key":"N0D3E6"},"description":"For the sub-group:  JIRASUB1,  description Jira subprocess 1\n\n            Estimation: \n\n            Module: Not asigned","summary":" JIRASUB1","issuetype":{"id":"10001"}}},
    {"fields":{"project":{"key":"N0D3E6"},"description":"Story that contains the steps that haven't been asigned to a sub-group","summary":"Other steps","issuetype":{"id":"10001"}}}
];

export const responseCreateIssuesArray = {
    "issues":[
        {"id":"10121","key":"N0D3E6-1","self":"https://choiceworx-test.atlassian.net/rest/api/latest/issue/10121"},
        {"id":"10122","key":"N0D3E6-2","self":"https://choiceworx-test.atlassian.net/rest/api/latest/issue/10122"}
    ],
    "errors":[]
};

export const responseAddAttachement = {
    data: [
        {
            "self":"https://choiceworx-test.atlassian.net/rest/api/2/attachment/10090",
            "id":"10090",
            "filename":"N0D3E6-3-on.jpg",
            "author":{
                "self":"https://choiceworx-test.atlassian.net/rest/api/2/user?accountId=5ec31534dd6b750c2260961a",
                "accountId":"5ec31534dd6b750c2260961a",
                "emailAddress":"jsolarte@choiceworx.com",
                "avatarUrls":{
                    "48x48":"https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5ec31534dd6b750c2260961a/cbc3f270-2d34-45c3-ab1f-8bf984b7061f/48",
                    "24x24":"https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5ec31534dd6b750c2260961a/cbc3f270-2d34-45c3-ab1f-8bf984b7061f/24",
                    "16x16":"https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5ec31534dd6b750c2260961a/cbc3f270-2d34-45c3-ab1f-8bf984b7061f/16",
                    "32x32":"https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5ec31534dd6b750c2260961a/cbc3f270-2d34-45c3-ab1f-8bf984b7061f/32"
                },
                "displayName":"Sebastian Solarte",
                "active":true,
                "timeZone":"America/Bogota",
                "accountType":"atlassian"
            },
            "created":"2020-08-05T13:41:54.215-0500",
            "size":49172,
            "mimeType":"image/jpeg",
            "content":"https://choiceworx-test.atlassian.net/secure/attachment/10090/N0D3E6-3-on.jpg",
            "thumbnail":"https://choiceworx-test.atlassian.net/secure/thumbnail/10090/N0D3E6-3-on.jpg"
        }
    ]
};