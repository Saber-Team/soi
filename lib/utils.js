var util = require('util');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var constants = require('./optimizer/constants');


function extend(target, src) {
  for(var k in src) {
    target[k] = src[k];
  }
}

/**
 * 判断是否目录
 * @param {String} path
 * @returns {Boolean}
 */
function isDirectory(path) {
  if (!fs.existsSync(path)) {
    console.log(
      chalk.bgYellow.bold('utils.isDirectory() could not resolve the path:\n  '
        + path)
    );
    return false;
  }
  var stat = fs.lstatSync(path);
  return stat.isDirectory();
}

/**
 * 判断是否文件
 * @param {String} path
 * @returns {Boolean}
 */
function isFile(path) {
  if (!fs.existsSync(path)) {
    console.log(
      chalk.bgYellow.bold('utils.isFile() could not resolve the path:\n  '
        + path)
    );
    return false;
  }
  var stat = fs.lstatSync(path);
  return stat.isFile();
}

/**
 * 判断是否数组
 * @param {*} o
 * @returns {Boolean}
 */
function isArray(o) {
  return util.isArray(o);
}

/**
 * 判断是否原生对象
 * @param {*} o
 * @returns {Boolean}
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

/**
 * 数组去重
 * @param {Array} arr
 */
function unique(arr) {
  var seen = {},
      cursorInsert = 0,
      cursorRead = 0;

  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = (typeof current).charAt(0) + current;

    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      arr[cursorInsert++] = current;
    }
  }
  arr.length = cursorInsert;
  return arr;
}

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {String} url
 * @returns {Boolean}
 */
function isAbsUrl(url) {
  return /:\//.test(url);
}

/**
 * Normalize windows path `\\` to *unix `/`;
 * @param {String} p
 * @returns {*|XML|string|void}
 */
function normalizeSysPath(p) {
  return path.normalize(p).replace(/\\/g, '/');
}

/**
 * Make directory.
 * @param {String} filepath
 */
function mkdir(filepath) {
  var dir = normalizeSysPath(filepath);
  if (fs.existsSync(dir)) {
    return;
  }

  if (soi().ENV.config.debug) {
    console.log(chalk.blue(
      'Make directory at: ' + dir + '\n'
    ));
  }

  if (/\/$/.test(dir)) {
    dir = dir.slice(0, -1);
  }
  var dirs = dir.split('/');
  dirs = dirs.reverse();

  var index = 0;
  while(!fs.existsSync(dir)) {
    dir = path.dirname(dir);
    index++;
  }
  for (var i = index - 1; i >= 0; i--) {
    dir += '/' + dirs[i];
    var p = dir + '/';
    try {
      fs.mkdirSync(p);
    } catch (ex) {
      console.log(chalk.bgRed.bold('When trying to mkdir: \n' +
        p + ' error occurred!\n  ' + ex.message));
      process.exit(1);
    }
  }
}

exports.extend = extend;
exports.isArray = util.isArray;
exports.isObject = isObject;
exports.unique = unique;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.isAbsUrl = isAbsUrl;
exports.normalizeSysPath = normalizeSysPath;
exports.mkdir = mkdir;