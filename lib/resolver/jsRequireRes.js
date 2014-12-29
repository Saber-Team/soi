// require.async(moduleId, callback)
exports.RE_REQUIRE_ASYNC =
  /\brequire(?:\n|\r|\r\n|\s)*\.async\((?:\s*["|'])([^'"]*)(?:["|']\s*)(?:\)|,(?:[^\)]*)\))/;

// lent from RequireJS
exports.RE_COMMENTS = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

exports.getRequireUrl = function(code) {
  var ret = code.match(exports.RE_REQUIRE_ASYNC);
  if (ret) {
    return ret[1];
  } else {
    return null;
  }
};