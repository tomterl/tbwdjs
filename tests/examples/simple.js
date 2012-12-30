var webdriverjs = require('../../lib/tbwdjs');
var client = webdriverjs.remote({
    host: 'hub.testingbot.com',
    desiredCapabilities: {
        browserName: 'internet explorer',
        version: 9,
        platform: 'WINDOWS',
        api_key: process.env.TESTINGBOT_KEY,
        api_secret: process.env.TESTINGBOT_SECRET
    }
});

client
    .testMode()
    .init()
    .url('http://google.com/')
    .titleEquals('Google')
    .end();