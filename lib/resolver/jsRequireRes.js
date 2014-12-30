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
  RE_REQUIRE_ASYNC.lastIndex = 0;
  var urls = [];
  code.replace(RE_REQUIRE_ASYNC, function (match, dep) {
    urls.push(dep);
  });

  return urls;
};

/**
 * Remove all comments of source file.
 * @param {!String} code Code in the JavaScript file read in.
 * @return {String} Return the code without comments;
 */
exports.removeComments = function(code) {
  RE_COMMENTS.lastIndex = 0;
  return code.replace(RE_COMMENTS, '');
};