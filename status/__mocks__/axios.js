/*
By default, jest always mock the modules with the same name of the files that are located in the __mocks__ folder.
For example, if this exact file was named different, Jest would not mock the axios module.
*/

const axios = {
    get: jest.fn(() => Promise.resolve({ message: "Mock Data Get" })), //Here we are only mocking the get property of the axios module.
    post: jest.fn(() => Promise.resolve({ message: "Mock Data Post" })) //Here we are only mocking the get property of the axios module.
};

module.exports = axios;