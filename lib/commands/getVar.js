exports.command = function(varname, callback) {
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
};
