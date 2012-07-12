exports.command = function(cssSelector, myTimeout, callback) {
  var self = this;
  var startTime = new Date().getTime();
  function checkForText() {
    var now = new Date().getTime();
    self.direct.element('css selector', cssSelector,
                        function(result) {
                          if (result.status === 0) {
                            self.direct.elementIdValue(result.value.ELEMENT,
                                  function(result2) {
                                    if (result2.status === 0 &&
                                        result2.value !== '') {
                                      if (typeof callback === 'function') {
                                        callback(result2.value);
                                      }
                                    } else {
                                      if (now - startTime < myTimeout) {
                                        setTimeout(checkForText, 500);
                                      } else {
                                        if (typeof callback === 'function') {
                                          callback(result2);
                                        }
                                      }
                                    }
                                  });
                          } else {
                            if (now - startTime < myTimeout) {
                              setTimeout(checkForText, 500);
                            } else {
                              if (typeof callback === 'function') {
                                callback(result);
                              }
                            }
                          }
                        });
  }
  checkForText();
};
