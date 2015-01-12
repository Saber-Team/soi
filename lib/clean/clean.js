// 3rd party
var rimraf = require('rimraf');

/**
 * Recursively remove specified path;
 * @param {String} path File path or directory path;
 * @param {Function} cb Handler function.
 */
module.exports = function(path, cb) {
  rimraf.sync(path, function(err) {
    cb.apply(null, arguments);
  });
};
