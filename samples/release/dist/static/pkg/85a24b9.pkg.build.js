/* Build by @Saber.T */
__d("HOicX", function(require, exports, module) {
/**
 * @module
 */

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn(e) {
  require.async(["vrcode"], function(vrcode) {
    if (vrcode.isPast()) {

    }
  });
}
});
/* Build by @Saber.T */
__d("fvr+Q", function(require, exports, module) {
/**
 * @module
 */

exports.identity = 'noname';
exports.fulfill = false;
});
/* Build by @Saber.T */
__d("SqQ7E", function(require, exports, module) {
/**
 * @module
 */

var A = require('base');

exports.getModuleA = function() {
  return new A();
};
});
/* Build by @Saber.T */
__d("vrcode", function(require, exports, module) {
/**
 * @provides vrcode
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});
/* Build by @Saber.T */
__d("base", function(require, exports, module) {
/**
 * @provides base
 * @module
 */

module.exports = {name: 'A'};
});
