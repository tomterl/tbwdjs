'use strict';
var assert = require('assert');
exports.command = function(cssSelector, visible, callback) {
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
                 });
};
