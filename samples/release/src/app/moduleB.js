/**
 * @module
 */

var A = require('./moduleA');

exports.getModuleA = function() {
  return new A();
};