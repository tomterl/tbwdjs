/**
 * tbwdjs -- TestingBotWebDriverJS
 * @author tom@goochesa.de (Tom Regner)
 *
 * based on the example code formerly provided by the testingbot.com
 * website (end-replacement).
 */

'use strict';

var webdriverjs = require('webdriverjs');
var http = require('http');
var qs = require('querystring');
var assert = require('assert');
var util = require('util');

var TbApi = require('./api');


/**
 * allow ~/.testingbot usage
 */
function fixAuth(options) {
  if (!options.api_key || !options.api_secret) {
    var fs = require('fs');
    try {
      var data = fs.readFileSync(process.env.HOME + '/.testingbot');
      if (data !== null) {
        var arr = data.toString().split(':');
        options.api_key = arr[0];
        options.api_secret = arr[1];
      }
    } catch (e) {
      console.log('couldn\'t read $HOME/.testingbot');
      console.log(e);
    }
  }
  return options;
}


/**
 * create a testingbot api client
 */
exports.api = function(options) {
  options = fixAuth(options);
  var t = new TbApi(options);
  return t;
};


/**
 * create a testingbot webdriver client
 */
exports.remote = function(options) {
  if (!options.host) {
    options.host = "hub.testingbot.com";
  }

  options.desiredCapabilities = fixAuth(options.desiredCapabilities);
  if (options.logLevel !== 'silent') {
    console.log('testingbot.com\n\n' +
            'Test startup might take up to 90 seconds.\n' +
            'We might need to fire up a pristine virtual machine for you.\n' +
            '(VM setup times do not deplete your testing minutes.)');
  }
  var client = webdriverjs.remote(options);

  if (options.withApi === true) {
    client.api = new TbApi(options.desiredCapabilities);
  }

  // replace the end function, so that the
  // testingbot session will be deleted
  var webjsEnd = client.end;
  client._errors = [];
  client.end = function(fn) {
    webjsEnd(function() {
      var name = options.name || 'unnamed';
      if (fn) { fn(); }
      if (!client.api) {
        client.api = new TbApi(options.desiredCapabilities);
      }
      client.api.updateTest({
        test: {
          success: client._errors.length === 0 ? 1 : 0,
          name: name
        }
      }, client.sessionId);
    });
  };

  /* additional protocol commands */
  client.addCommand('windowHandle', function(callback) {
    var commandOptions = {
      path: '/session/:sessionId/window_handle',
      method: 'GET'
    };

    var data = {};

    this.executeProtocolCommand(
        commandOptions,
        this.proxyResponse(callback),
        data
    );
  });

  /* commands that push to client._error */
  client.addCommand('titleEquals', function(expected, callback) {
    var self = this;
    self.direct.title(function(title) {
      try {
        assert.equal(title.value, expected);
      } catch (e) {
        self._errors.push(e);
      }
      self.showTest(title.value === expected,
                    title.value, expected,
                    'Title is "' + expected + '"'
      );
      if (typeof callback === 'function') {
        callback(title.value === expected);
      }
    });
  });
  client.addCommand('cssVisible', function(cssSelector, visible, callback) {
    var self = this;
    self.isVisible(cssSelector,
                   function(result) {
                     try {
                       assert.equal(result, visible);
                     } catch (e) {
                       self._errors.push(e);
                     }
                     self.showTest(result === visible, result, visible,
                                   cssSelector +
                                   (visible ? ' ' : ' not ') +
                                   'visible');
                     if (typeof callback === 'function') {
                       callback(result);
                     }
                   }
    );
  });
  client.addCommand('evaluate', function(fun, expected, message, callback) {
    var self = this;
    self.direct.execute(fun, function(result) {
      try {
        assert(result.value, expected);
      } catch (e) {
        self._errors.push(e);
      }
      self.showTest(result.value === expected, result.value, expected, message);
      if (typeof callback === 'function') {
        callback(result);
      }
    });
  });
  client.addCommand('waitForVar',
                    function(varname, expected, myTimeout, equality, callback) {
                      var self = this;
                      var startTime = new Date().getTime();
                      function checkValue(val) {
                        return equality ? val === expected : val !== expected;
                      }
                      function checkVariable() {
                        var now = new Date().getTime();
                        var code = 'var myResult = ' +
                           varname + '; return myResult;';
                        self.direct.execute(code, function(result) {
                          if (result.status === 0 && checkValue(result.value)) {
                            if (typeof callback === 'function') {
                              callback(result.value);
                            }
                          } else {
                            if (now - startTime < myTimeout) {
                              setTimeout(checkVariable, 500);
                            } else if (typeof callback === 'function') {
                              callback(result);
                            }
                          }
                        });
                      }
                      checkVariable();
                    }
                   );
  client.addCommand('waitForTextIn',
                    function(cssSelector, myTimeout, callback) {
                      var self = this;
                      var startTime = new Date().getTime();
                      function checkForText() {
                        var now = new Date().getTime();
                        self.direct.element('css selector', cssSelector,
                            function(result) {
                              if (result.status === 0) {
                                self.direct.elementIdText(result.value.ELEMENT,
                                    function(result2) {
                                      if (result2.status === 0 &&
                                          result2.value !== '') {
                                        if (typeof callback === 'function') {
                                          callback(result2.value);
                                        }
                                      } else {
                                        if (now - startTime < myTimeout) {
                                          setTimeout(checkForText, 500);
                                        } else {
                                          if (typeof callback === 'function') {
                                            callback(result2);
                                          }
                                        }
                                      }
                                    });
                              } else {
                                if (now - startTime < myTimeout) {
                                  setTimeout(checkForText, 500);
                                } else {
                                  if (typeof callback === 'function') {
                                    callback(result);
                                  }
                                }
                              }
                            });
                      }
                      checkForText();
                    }
                   );
  client.addCommand('waitForValueIn',
                    function(cssSelector, myTimeout, callback) {
                      var self = this;
                      var startTime = new Date().getTime();
                      function checkForText() {
                        var now = new Date().getTime();
                        self.direct.element('css selector', cssSelector,
                            function(result) {
                              if (result.status === 0) {
                                self.direct.elementIdValue(result.value.ELEMENT,
                                    function(result2) {
                                      if (result2.status === 0 &&
                                          result2.value !== '') {
                                        if (typeof callback === 'function') {
                                          callback(result2.value);
                                        }
                                      } else {
                                        if (now - startTime < myTimeout) {
                                          setTimeout(checkForText, 500);
                                        } else {
                                          if (typeof callback === 'function') {
                                            callback(result2);
                                          }
                                        }
                                      }
                                    });
                              } else {
                                if (now - startTime < myTimeout) {
                                  setTimeout(checkForText, 500);
                                } else {
                                  if (typeof callback === 'function') {
                                    callback(result);
                                  }
                                }
                              }
                            });
                      }
                      checkForText();
                    }
                   );
  client.addCommand('getVar',
                    function(varname, callback) {
                      var self = this;
                      var code = 'var myResult = ' +
                         varname + '; return myResult;';
                      self.direct.execute(code, function(result) {
                        if (result.status === 0) {
                          if (typeof callback === 'function') {
                            callback(result.value);
                          }
                        } else if (typeof callback === 'function') {
                          callback(result);
                        }
                      });
                    }
                   );

  return client;
};
