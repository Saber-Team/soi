/**
 * @module
 */

var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn(e) {
  require.async(['./vrcode'], function(vrcode) {
    if (vrcode.isPast()) {

    }
  });
}