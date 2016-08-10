__d("vrcode", function(require, exports, module) {
/**
 * @provides vrcode
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});