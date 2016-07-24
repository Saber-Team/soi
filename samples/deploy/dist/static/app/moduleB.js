__d("src/app/moduleB.js", function(require, exports, module) {


var A = require('src/app/moduleA.js');

exports.getModuleA = function() {
  return new A();
};
});