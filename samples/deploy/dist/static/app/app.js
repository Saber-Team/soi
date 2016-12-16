

var moduleA = require('AQJGK');
var moduleB = require('zMZ2x');
var moduleC = require('T4EMD');

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn() {
  require.async(["tospe"], function(vrcode) {
    if (vrcode.isPast()) {
      alert('done!');
    }
  });
}