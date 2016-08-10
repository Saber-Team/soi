__d("tospe", function(require, exports, module) {
/**
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});