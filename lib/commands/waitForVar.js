'use strict';
exports.command = function(varname, expected, myTimeout, equality, callback) {
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
};
