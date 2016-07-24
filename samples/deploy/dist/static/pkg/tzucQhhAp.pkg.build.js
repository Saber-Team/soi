__d("src/app/vrcode.js", function(require, exports, module) {


exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});
__d("src/app/moduleA.js", function(require, exports, module) {


exports.identity = 'moduleA';
exports.fulfill = false;

});
__d("src/app/moduleB.js", function(require, exports, module) {


var A = require('src/app/moduleA.js');

exports.getModuleA = function() {
  return new A();
};
});
__d("src/app/moduleC.js", function(require, exports, module) {


var moduleB = require('src/app/moduleB.js');

module.exports = {name: 'C'};
});
kerneljs.exec("app", function(require, exports, module) {


var moduleA = require('src/app/moduleA.js');
var moduleB = require('src/app/moduleB.js');
var moduleC = require('src/app/moduleC.js');

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn() {
  require.async(["src/app/vrcode.js"], function(vrcode) {
    if (vrcode.isPast()) {
      alert('done!');
    }
  });
}
});
