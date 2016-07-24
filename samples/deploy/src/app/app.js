/**
 * @entry
 * @provides app
 */

var moduleA = require('./moduleA');
var moduleB = require('./moduleB');
var moduleC = require('./moduleC');

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn() {
  require.async(['./vrcode'], function(vrcode) {
    if (vrcode.isPast()) {
      alert('done!');
    }
  });
}