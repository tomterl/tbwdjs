exports.command = function(fun, expected, message, callback) {
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
};
