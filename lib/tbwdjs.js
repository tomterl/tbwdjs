/**
 * tbwdjs -- TestingBotWebDriverJS
 * @author tom@goochesa.de (Tom Regner)
 */

'use strict';

var webdriverjs = require('webdriverjs');
var http = require('http');
var qs = require('querystring');
var assert = require('assert');

var console = require('console');
var util = require('util');


/**
 * create a testingbot webdriver client
 */
exports.remote = function(options) {
  var client = webdriverjs.remote(options);

  // replace the end function, so that the
  // testingbot session will be deleted
  var webjsEnd = client.end;
  client._errors = [];
  client.end = function(fn) {
    webjsEnd(function() {
      var name = options.name || 'unnamed';
      if (fn) { fn(); }
      console.log(util.inspect(client._errors));
      var postData = qs.stringify({
        client_key: client.desiredCapabilities['api_key'],
        client_secret: client.desiredCapabilities['api_secret'],
        session_id: client.sessionId,
        success: client._errors.length === 0,
        name: name,
        kind: 10
      });

      var post_options = {
        host: 'testingbot.com',
        port: '80',
        path: '/hq',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      // Set up the request
      var post_req = http.request(post_options, function(res) {
                       res.setEncoding('utf8');
                     });

      // post the data
      post_req.write(postData);
      post_req.end();
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
    self.title(function(title) {
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
  return client;
};
