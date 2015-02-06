'use strict';

// system
var chalk = require('chalk');

/**
 * Log message as en error, but without exiting process.
 * @param {string} var_msg
 */
exports.error = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.red.bold(msg));
};
/**
 * Log message as warning, but without exiting process.
 * @param {string} var_msg
 */
exports.warn = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.yellow(msg));
};
/**
 * Log message as assert ok.
 * @param {string} var_msg
 */
exports.ok = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.green(msg));
};
/**
 * Log message as info.
 * @param {string} var_msg
 */
exports.info = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.cyan(msg));
};