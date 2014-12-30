// require.async(moduleId, callback)
exports.RE_REQUIRE_ASYNC =
  /\brequire\s*\.async\(\s*["']([^'"\s]+)["'][^\)]*\)/g;

/* /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g */

// lent from RequireJS
exports.RE_COMMENTS = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

/**
 * 抽取代码中使用require.async的地方
 * @param code
 * @returns {*}
 */
exports.getRequireUrl = function(code) {
  var ret = code.match(exports.RE_REQUIRE_ASYNC);
  if (ret) {
    return ret[1];
  } else {
    return null;
  }
};