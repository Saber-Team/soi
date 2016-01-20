/**
 * @module
 */

var A = require('./with-id');
exports.getModuleA = function() {
  return new A();
};