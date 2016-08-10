__d("src/app/vrcode.js", function(require, exports, module) {
/**
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});