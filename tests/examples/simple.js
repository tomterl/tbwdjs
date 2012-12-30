var webdriverjs = require('../../lib/tbwdjs');
var client = webdriverjs.remote({
    host: 'hub.testingbot.com',
    desiredCapabilities: {
        browserName: 'internet explorer',
        version: 9,
        platform: 'WINDOWS',
        api_key: process.env.TESTINGBOT_KEY,
        api_secret: process.env.TESTINGBOT_SECRET,
        name: (process.env.TRAVIS_JOB_ID ? ("Travis Build " + process.env.TRAVIS_JOB_ID) : "Simple Test"),
        privacy: 1
    }
});

client
    .testMode()
    .init()
    .url('http://google.com/')
    .titleEquals('Google')
    .end();