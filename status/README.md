# AWS Lambda: JavaScript template

## Status:

Template

## Motivation:

Stablish a development template for DAPI's AWS Lambdas

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

In order to use this template you must have installed NodeJS

### Installing

Run the following command to install all the dependencies

```
npm install
```

## Running the tests

### Break down into end to end tests

To test all the tests via [Jest](https://github.com/facebook/jest) is necessary to execute the following command:

```
npm run test
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Description

Lambda development guideline:

- Use the JavaScript standards (ECMAScript): use the newest standards as possible but check for incompatibilities(the Babel transpiler set in this template translate your ECMAScript code to JavaScript code, so use it avoid the incompatibility problems) between the standard and the NodeJS supported version (https://node.green/)..

- For now, the parameter to determinate the content of a lambda is the context of the functionalities, so, while your function does not exceed the AWS Lambda limits (https://docs.aws.amazon.com/lambda/latest/dg/limits.html) and the lambda function keeps a close common operational context, the number of subfunctions inside the lambda is not limited.

- Folder structure:
  ```javaScript
      index.js        // Main Lambda handler container.
                      // See more in https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
      controllers     // Folder with transactions/controllers files
      handlers        // Internal handlers for optional internal segmentation
      helpers         // Conections or instances for external services
  }
  ```
- The index.js will content the main event handler, the path parameters getter, and, if it is necessary, a switch router that directs the requirement through an inner function or handler.

- The "handlers folder" has inner router switches for optional internal segmentation. The internal segmentation is an option to reduce for example the computing cost and the response time.

- In addition, the lambda response schemas should be in the index.js file and contents at least the parameters listed in the template. Be sure of taking into account the formats and adequate status codes.

- All Lambda functions should have a readme file with at least the next requirements:

  - Lambda name
  - Description: how is the structure and how it accomplishes its purpose
  - Status: in-development/in-production/re-building/hot-fixing
  - How to test locally: commands and indications to perform the test locally

- Comment the code is mandatory and required for documentation generation, comments should generally be placed immediately before the code being documented. Each comment must start with a /** sequence in order to be recognized by the documentation generator. Comments beginning with /_, /_**, or more than 3 stars will be ignored.
  example:

  ```javaScript
      /**
      *  Represents a book.
      *  @constructor
      */
      function Book(title, author) {
  }
  ```

  for how to comment guidance see http://usejsdoc.org/about-getting-started.html.
  Also, you can use VSCode plugins for comments generation (see "jsdoc comments" on VSCode marketplace)

- Documentation: the library for documentation is jsdoc (https://www.npmjs.com/package/jsdoc) jsdoc generates documentation from the comments in the code, it is recommended to check jsdoc documentation for guidance (http://usejsdoc.org/).

  jsdoc example: to generate documentation for index.js and files in the ./transactions and ./helpers directories, using the configuration file ./jsdocConfig.json, and save the output in the ./docs directory use:

  jsdoc index.js -c jsdocConfig.json -d docs

  an example of a jsdocConfig.json is this:

  ```JSON
  {
      "plugins": [],
      "recurseDepth": 10,
      "source": {
          "include": ["transactions", "helpers", "handlers"]

      },
      "sourceType": "module",
      "tags": {
          "allowUnknownTags": true,
          "dictionaries": ["jsdoc","closure"]
      },
      "templates": {
          "cleverLinks": false,
          "monospaceLinks": false
      }
  }
  ```

  too see a extended explanation visit http://usejsdoc.org/about-configuring-jsdoc.html

- Linter: it is recomended to use a linter tool for coding, the PR generated can be rejected by the reviewers if the code in the commit is not clear and clean. This template has the linter configuration working with jslint.

- Code formatter: the PR can be rejected by the reviewers if the code in the commit is not clear and clean. This template includes the configuration file with rules for the code formatter 'Prettier' in order to standardize your code and facilitate its reading and revision.
