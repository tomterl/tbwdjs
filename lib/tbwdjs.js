/**
 * tbwdjs -- TestingBotWebDriverJS
 * @author tom@goochesa.de (Tom Regner)
 *
 * based on the example code formerly provided by the testingbot.com
 * website (end-replacement).
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

var webdriverjs = require('webdriverjs');
var http = require('http');
var qs = require('querystring');
var assert = require('assert');
var util = require('util');
var fs = require('fs');
var path = require('path');

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
        var arr = data.toString().replace('\n', '').split(':');
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
    options.host = 'hub.testingbot.com';
  }

  options.desiredCapabilities = fixAuth(options.desiredCapabilities);
  if (options.logLevel !== 'silent') {
    console.log('testingbot.com\n\n' +
            'Test startup might take up to 90 seconds.\n' +
            'We might need to fire up a pristine virtual machine for you.\n' +
            '(VM setup times do not deplete your testing minutes.)');
  }
  var client = webdriverjs.remote(options);

  client.api = new TbApi(options.desiredCapabilities);

  // replace the end function, so that the
  // testingbot session will be deleted
  var webjsEnd = client.end;
  client._errors = [];
  client.end = function(fn) {
    webjsEnd(function() {
      var name = options.name || 'unnamed';
      client.api = new TbApi(options.desiredCapabilities);
      client.api.updateTest({
        test: {
          success: client._errors.length === 0 ? 1 : 0,
          name: name
        }
      }, client.sessionId, fn);
    });
  };

  var subs = ['/commands/', '/asserts/', '/protocol/'];
  for (var s = 0, ss = subs.length; s < ss; ++s) {
    var commandFiles = fs.readdirSync(__dirname + subs[s]);
    for (var i = 0, ii = commandFiles.length; i < ii; ++i) {
      if (path.extname(commandFiles[i]) === '.js') {
        var commandName = path.basename(commandFiles[i], '.js');
        client.addCommand(commandName,
                          require('.' + subs[s] + commandFiles[i]).command);
      }
    }
  }
  var colors = { /* temp copy from webdriverjs.js */
    black: '\x1b[0;30m',
    dkgray: '\x1b[1;30m',
    brick: '\x1b[0;31m',
    red: '\x1b[1;31m',
    green: '\x1b[0;32m',
    lime: '\x1b[1;32m',
    brown: '\x1b[0;33m',
    yellow: '\x1b[1;33m',
    navy: '\x1b[0;34m',
    blue: '\x1b[1;34m',
    violet: '\x1b[0;35m',
    magenta: '\x1b[1;35m',
    teal: '\x1b[0;36m',
    cyan: '\x1b[1;36m',
    ltgray: '\x1b[0;37m',
    white: '\x1b[1;37m',
    reset: '\x1b[0m'
  };

  client.showInfo = function(msg) {
    console.log(colors.blue + '→' + colors.reset + '\t' + msg);
  };

  return client;
};
