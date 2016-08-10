kerneljs.exec("app", function(require, exports, module) {
/**
 * @entry
 * @provides app
 */

var moduleA = require('src/app/moduleA.js');
var moduleB = require('src/app/moduleB.js');
var moduleC = require('src/app/moduleC.js');

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn() {
  require.async(["src/app/vrcode.js"], function(vrcode) {
    if (vrcode.isPast()) {

    }
  });
}
});