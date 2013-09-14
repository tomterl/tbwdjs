'use strict';
var assert = require('assert');
exports.command = function(pattern, callback) {
  var self = this;
  self.title(function(title) {
    try {
      assert.equal(pattern.test(title.value), true);
    } catch (e) {
      self._errors.push(e);
    }
    self.showTest(pattern.test(title.value) === true,
                  title.value, pattern,
                  'Title matches "' + pattern + '"');
    if (typeof callback === 'function') {
      callback(pattern.test(title.value));
    }
  });
};
