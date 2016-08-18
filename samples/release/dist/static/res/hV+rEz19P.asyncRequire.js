__d("dj5Pa", function(require, exports, module) {
'use strict';

/**
 * @module
 */

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn(e) {
  require.async(["vrcode"], function (vrcode) {
    if (vrcode.isPast()) {}
  });
}
});