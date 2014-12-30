// require.async(moduleId, callback)
var RE_REQUIRE_ASYNC =
  /\brequire\s*\.async\(\s*["']([^'"\s]+)["'][^\)]*\)/g;

/* /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g */

// lent from RequireJS
var RE_COMMENTS = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

/**
 * Retrieve all modules require.async invoked with.
 * @param {!String} code Code in the JavaScript file read in.
 * @returns {Array.<String>} urls in an array.
 */
exports.getRequireUrls = function(code) {
  var ret = code.match(RE_REQUIRE_ASYNC);
  if (ret) {
    return ret[1];
  } else {
    return null;
  }
};

/**
 * Remove all comments of source file.
 * @param {!String} code Code in the JavaScript file read in.
 * @return {String} Return the code without comments;
 */
exports.removeComments = function(code) {
  return code.replace(RE_COMMENTS, '');
};