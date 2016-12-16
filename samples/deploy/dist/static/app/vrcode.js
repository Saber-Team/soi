__d("tospe", [], function(global, require, module, exports) {


exports.isPast = function() {
  return Boolean('<%$_REQUEST["token"]%>');
};
});