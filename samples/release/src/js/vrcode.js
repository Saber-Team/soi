/**
 * @provides vrcode
 * @module
 */

exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};