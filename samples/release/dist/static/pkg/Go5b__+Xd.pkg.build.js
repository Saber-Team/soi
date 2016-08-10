__d("tospe", function(require, exports, module) {
/**
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});
__d("AQJGK", function(require, exports, module) {
/**
 * @module
 * @css ./moduleA.css
 */

exports.identity = 'moduleA';
exports.fulfill = false;
});
__d("zMZ2x", function(require, exports, module) {
/**
 * @module
 */

var A = require('AQJGK');

exports.getModuleA = function() {
  return new A();
};
});
__d("T4EMD", function(require, exports, module) {
/**
 * @module
 */

var moduleB = require('zMZ2x');

module.exports = {name: 'C'};
});
kerneljs.exec("app", function(require, exports, module) {
/**
 * @entry
 * @provides app
 */

var moduleA = require('AQJGK');
var moduleB = require('zMZ2x');
var moduleC = require('T4EMD');

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn() {
  require.async(["tospe"], function(vrcode) {
    if (vrcode.isPast()) {

    }
  });
}
});
