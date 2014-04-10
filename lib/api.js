/**
 * tbwdjs -- TestingBotWebDriverJS
 * @author tom@goochesa.de (Tom Regner)
 * @author info@testingbot.com (TestingBot)
 *
 * wrapper to access the TestingBot API
 *
 * Copyright (c) 2012 tom@goochesa.de (Tom Regner)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var http = require('http');
var querystring = require('qs');

module.exports = TestingBot;
function TestingBot(options) {
  this.options = options || {};
  this.options.api_key = process.env.TESTINGBOT_KEY || this.options.api_key || null;
  this.options.api_secret = process.env.TESTINGBOT_SECRET || this.options.api_secret || null;
}

TestingBot.prototype.getTestDetails = function(testID, callback) {
  this.api({
    method: 'GET',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.getBrowsers = function(callback, type) {
  var data = {};
  if (type) {
    data.type = type;
  }
  this.api({
    method: 'GET',
    url: '/browsers',
    data: data
  }, callback);
};

TestingBot.prototype.getLabTestDetails = function(testID, callback) {
  this.api({
    method: 'GET',
    url: '/lab/' + testID
  }, callback);
};

TestingBot.prototype.getTunnel = function(callback) {
  this.api({
    method: 'GET',
    url: '/tunnel'
  }, callback);
};

TestingBot.prototype.getUserInfo = function(callback) {
  this.api({
    method: 'GET',
    url: '/user'
  }, callback);
};

TestingBot.prototype.getTests = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }
  this.api({
    method: 'GET',
    url: '/tests/',
    data: { offset: offset, limit: limit }
  }, callback);
};

TestingBot.prototype.getLabTests = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }
  this.api({
    method: 'GET',
    url: '/lab',
    data: { offset: offset, limit: limit }
  }, callback);
};

TestingBot.prototype.updateUserInfo = function(data, callback) {
  this.api({
    method: 'PUT',
    url: '/user',
    data: data
  }, callback);
};

TestingBot.prototype.updateTest = function(data, testID, callback) {
  this.api({
    method: 'PUT',
    url: '/tests/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.updateLabTest = function(data, testID, callback) {
  this.api({
    method: 'PUT',
    url: '/lab/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.deleteTest = function(testID, callback) {
  this.api({
    method: 'DELETE',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.deleteLabTest = function(testID, callback) {
  this.api({
    method: 'DELETE',
    url: '/lab/' + testID
  }, callback);
};

TestingBot.prototype.api = function(req_data, callback) {

  var self = this;

  var url = req_data.url;
  if (req_data.method === 'GET' && req_data.data) {
    var path = + '?' + querystring.stringify(req_data.data);
  }

  var req_options = {
    host: 'api.testingbot.com',
    port: 80,
    path: '/v1/' + url,
    method: req_data.method
  };

  req_options.headers = req_data.headers || {};
  req_options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  req_options.headers['Content-length'] =
      req_data.data ? querystring.stringify(req_data.data).length : 0;

  req_options.auth = this.options.api_key + ':' + this.options.api_secret;

  var req = http.request(req_options, function(res) {
    res.setEncoding('utf8');
    var response = '';
    res.on('data', function(chunk) {
      response += chunk;
    }).on('end', function() {
      if (typeof(callback) === 'function') {
        try {
          if (res.statusCode === 200) {
            callback(JSON.parse(response), null);
          } else {
            callback(null, JSON.parse(response));
          }
        } catch (err) {
          callback('Couldnt parse ' + response);
        }
      }
    });
  });

  req.on('error', function(e) {
    var response = 'error';
    if (typeof(callback) === 'function') {
      callback(response);
    }
  });

  if (self.options.method !== 'GET' && req_data.data) {
    // write data to request body
    req.write(querystring.stringify(req_data.data));
  }
  req.end();
};
