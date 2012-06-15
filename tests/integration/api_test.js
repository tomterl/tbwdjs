'use strict';
var TbApi = require('../../lib/api.js');

module.exports = {
  setUp: function(callback) {
    var fs = require('fs');
    try {
      var data = fs.readFileSync(process.env.HOME + '/.testingbot');
      if (data !== null) {
        var arr = data.toString().replace('\n', '').split(':');
        var api_key = arr[0];
        var api_secret = arr[1];
        this.api = new TbApi({ api_key: api_key, api_secret: api_secret });
        callback();
      }
    } catch (e) {
      console.log('couldn\'t read $HOME/.testingbot');
      console.log(e);
    }
  },
  tearDown: function(callback) {
    // clean up
    callback();
  },
  testInfoUser: function(test) {
    var userInfo = this.api.getUserInfo(function(response) {
                     test.ok(true, (typeof(response.first_name) === 'String'));
                     test.ok(true, (response.plan !== undefined));
                     test.done();
                   });
  },
  testWrongCredentials: function(test) {
    var api = new TbApi({api_key: 'bogus', api_secret: 'bogus'});
    var userInfo = api.getUserInfo(function(response) {
                     test.equal(null, response);
                     test.done();
                   });
  },
  testUpdateInfoUser: function(test) {
    var firstName = 'testing' + Math.round(Math.random() * 100);

    var data = {
      'user[first_name]' : firstName
    };
    var that = this;
    var userInfo = this.api.updateUserInfo(data, function(r) {
                     var userInfo = that.api.getUserInfo(function(response) {
                                      test.equal(firstName,
                                                 response.first_name);
                                      test.done();
                                    });
                   });
  },
  testListTests: function(test) {
    var list = this.api.getTests(function(response) {
                 test.ok(response.data && response.data.length > 0, true);
                 test.done();
               });
  },
  testInfoSpecificTest: function(test) {
    var that = this;
    var testInfo = this.api.getTests(function(response) {
                     test.ok(response.data && response.data.length > 0, true);
                     var singleTest = response.data[0];

                     that.api.getTestDetails(singleTest.id,
                                             function(response) {
                                               test.equal(
                                                   response.session_id,
                                                   singleTest.session_id);
                       test.done();
                     });
                   });
  },
  testInfoNotFoundTest: function(test) {
    var notFound = this.api.getTestDetails(324234234324, function(response) {
                     test.equal(null, response);
                     test.done();
                   });
  },
  testUpdateTest: function(test) {
    var that = this;
    var testInfo = this.api.getTests(function(response) {
                     test.ok(response.data && response.data.length > 0, true);
                     var singleTest = response.data[0];

                     var newTestName = 'test' + Math.round(Math.random() * 100);
                     var newTestData = {
                       'test[name]' : newTestName
                     };
                     that.api.updateTest(newTestData, singleTest.id,
                                         function(response) {
                                           that.api.getTestDetails(
                                               singleTest.id,
                                               function(response) {
                                                 test.equal(response.name,
                                                            newTestName);
                                                 test.done();
                                               });
                                         });
                   });
  },
  testUpdateTestNotFound: function(test) {
    var newTestName = 'test' + Math.round(Math.random() * 100);
    var newTestData = {
      'test[name]' : newTestName
    };
    var update = this.api.updateTest(newTestData,
                                     324324234,
                                     function(response) {
                                       test.equal(null, response);
                                       test.done();
                                     });
  }
};
