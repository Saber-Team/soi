__d("src/js/async-require.js", function(require, exports, module) {


var $btn = document.querySelector('button');
document.addEventListener($btn, 'click', fn);

function fn(e) {
  require.async(["vrcode"], function(vrcode) {
    if (vrcode.isPast()) {

    }
  });
}
});