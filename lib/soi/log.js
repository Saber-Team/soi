/**
 * @fileoverview 向控制台写入消息
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

// system
var chalk = require('chalk');

/**
 * 显示错误消息但不退出进程.
 * @param {string} var_msg
 */
exports.error = function (var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.red.bold(msg))
};

/**
 * 显示警告.
 * @param {string} var_msg
 */
exports.warn = function (var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.yellow(msg));
};

/**
 * 显示完成消息.
 * @param {string} var_msg
 */
exports.ok = function (var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.green(msg))
};

/**
 * 显示实用信息.
 * @param {string} var_msg
 */
exports.info = function (var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.info(chalk.cyan(msg))
};