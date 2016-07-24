__d("vrcode", function(require, exports, module) {


exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});