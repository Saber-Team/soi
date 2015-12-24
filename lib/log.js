/**
 * @file 向控制台写入消息
 */

'use strict';

var E = String.fromCharCode(27);

function wrap(options, text) {
  return E + '[' + options + 'm' + text + E + '[m';
}

function bold(text) {
  return wrap('1', text);
}

function underline(text) {
  return wrap('4', text);
}

function awesome(text) {
  return wrap('1;4;7;5;42;35', text);
}

var colors = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7
};

function color(name, text) {
  return E + '[' + (colors[name] + 30) + 'm' + text + E + '[39m';
}

exports.bold = bold;
exports.underline = underline;
exports.awesome = awesome;
exports.color = color;

/**
 * 显示错误消息但不退出进程.
 * @param {string} var_msg
 */
exports.error = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('red', msg));
};

/**
 * 显示警告.
 * @param {string} var_msg
 */
exports.warn = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('yellow', msg));
};

/**
 * 显示完成消息.
 * @param {string} var_msg
 */
exports.ok = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('green', msg));
};

/**
 * 显示实用信息.
 * @param {string} var_msg
 */
exports.info = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('cyan', msg));
};