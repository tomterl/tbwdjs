exports.command = function(expected, callback) {
  var self = this;
  self.direct.title(function(title) {
    try {
      assert.equal(title.value, expected);
    } catch (e) {
      self._errors.push(e);
    }
    self.showTest(title.value === expected,
                  title.value, expected,
                  'Title is "' + expected + '"');
    if (typeof callback === 'function') {
      callback(title.value === expected);
    }
  });
};
