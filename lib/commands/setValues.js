'use strict';
exports.command = function(valHash, callback) {
  var keys = Object.keys(valHash);
  var self = this;
  var results = {};
  var addResult = function(result) {
    if (result && result.status === 0) {
      results[keys[i]] = result.value;
    } else {
      results[keys[i]] = result;
    }
  };

  for (var i = 0; i < keys.length; ++i) {
    self.setValue(keys[i],
                  valHash[keys[i]],
                  addResult);
  }
  if (typeof callback === 'function') {
    callback(results);
  }
};
