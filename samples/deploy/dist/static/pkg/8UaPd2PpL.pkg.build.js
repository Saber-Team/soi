__d("AQJGK", [], function(global, require, module, exports) {


exports.identity = 'moduleA';
exports.fulfill = false;

});
__d("zMZ2x", ["AQJGK"], function(global, require, module, exports) {


var A = require('AQJGK');

exports.getModuleA = function() {
  return new A();
};
});
__d("T4EMD", ["zMZ2x"], function(global, require, module, exports) {


var moduleB = require('zMZ2x');

module.exports = {name: 'C'};
});


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
__d("tospe", [], function(global, require, module, exports) {


exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});
