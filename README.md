# tbwdjs -- TestingBotWebDriverJS

A small wrapper around camme/webdriverjs, that eases testing on ([TestingBot](http://testingbot.com))

[![Travis Test Status](https://secure.travis-ci.org/testingbot/tbwdjs.png)](https://travis-ci.org/testingbot/tbwdjs)

## Installation

     $ npm install testingbot
## Usage
   
   The boilerplate example given by the testingbot.com node.js wizard is
   reduced to

	  var webdriverjs = require('tbwdjs');
     var client = webdriverjs.remote({
         host: 'hub.testingbot.com',
         desiredCapabilities: {
             browserName: 'internet explorer',
             version: 9,
             platform: 'WINDOWS',
             api_key: 'YOURKEY',
             api_secret: 'YOUSECRET'
         }
     });
     
     client
         .init()
         .url('http://google.com/')
         .titleEquals('Google')
         .end();

## Additional commands
	- =windowHandle()= Protocol command that returns the handle of the
      current browser window.
	- =titleEquals(title[, callback]})= checks if the current
      windowtitle equals /title/; errors are noted and will mark the
      check as failed on testingbot.com.
	- =titleMatches(pattern[, callback]})= checks if the current
      windowtitle matches the regular expression /pattern/; errors are
      noted and will mark the check as failed on testingbot.com.
	- =cssVisible(cssSelector, visible[, callback])= checks if the
      element identified by /cssSelector/ is visible or not according
      to the parameter /visible/; errors are noted and will mark the
      check as failed on testingbot.com.
	- =evaluate(code, expected[, callback])= Inject the given /code/
      (javascript) into the browser. The /code/ has to =return= a
      value; if this value matches /expected/, the check is
      successful - otherwise it fails; errors are noted and will
      mark the check as failed on testingbot.com.
	- =switchWindow()= Useful if you have /target="blank"/
      links/forms/buttons. Successful if it can switch to another
      window, unsuccessful otherwise; errors are noted and will mark
      the check as failed on testingbot.com
	- =waitForVar(varname, expected, timeout, equality[, callback])=
      Wait at least /timeout/ seconds for the variable /varname/ to
      (not) equal to /expected/ (depending on the equality value
      given). Does not affect check status.
	- =waitForTextIn(cssSelector, timeout[, callback])= Wait at least
      /timeout/ seconds for the element identified by /cssSelector/ to
      appear and contain text. Does not affect check status.
	- =waitForValueIn(cssSelector, timeout[, callback])= Wait at least
      /timeout/ seconds for the element identified by /cssSelector/ to
      appear and have a non empty value attribute. Does not affect
      check status.
	- =getVar(varname[, callback])= Inject javascript into the browser
      under test to return the current value of the variable
      /varname/.
	- =setValues(valHash[, callback])= Pass key/value pairs as hash to
      set multiple elements values in one go. Keys are css selector
      statements, values the values to set. /callback/ is passed a
      hash with the result for each css selector.  Does not affect
      check status.
	- =showInfo(message)= Log an informational message formatted like
      the output of the test-functions. Use it for example to log
      command results: =client.showInfo(result.value);=.

## testingbot.com API
  
  Included are convenience methods to query the TestingBot API.
  Please have a look at this example to access the api only:
 
    var tbwdjs  = require('tbwdjs');
    var t = tbwdjs.api({ api_key: 'key', api_secret: 'secret'});
    t.getBrowsers(function(browsers) { console.log(browsers); });

  You can always access the api during tests with your client-object:

    var webdriverjs = require('tbwdjs');
    var client = webdriverjs.remote({
        host: 'hub.testingbot.com',
        desiredCapabilities: {
            browserName: 'internet explorer',
            version: 9,
            platform: 'WINDOWS'
        }
    });
    
    client.api.getBrowsers(function(browsers) {
        console.log(browsers);
    });
    
## Authenticate with ~/.testingbot

	You can omit the authentication data if you have your
	~/.testingbot setup as described on ([TestingBot](http://testingbot.com)).

## Contribute

   Every contribution is welcome. Simply fork the repository, do your
   stuff and issue a pull request.
   
   Contributions should be make jshint and make jslint
   clean. make jshint will install the npm module locally if it is
   not present. make jslint depends on Google's ([closure linter](https://developers.google.com/closure/utilities/)), gjslint must be in your path.

## License

See LICENSE.
