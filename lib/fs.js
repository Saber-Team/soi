/**
 * @fileoverview 文件系统相关函数
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

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
 * 创建目录.
 * @param {String} filepath
 */
function mkdir(filepath) {
  var dir = soi.utils.normalizeSysPath(filepath);
  if (fs.existsSync(dir))
    return;

  if (soi().ENV.config.debug) {
    console.log(chalk.blue(
            'Make directory at: ' + dir + '\n'
    ));
  }

  if (/\/$/.test(dir))
    dir = dir.slice(0, -1);

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

/**
 * 读文件.
 * @param {String} path
 * @param {Object} option
 * @returns {*}
 */
function readFile(path, option) {
  try {
    var code = fs.readFileSync(path, {
      encoding: option && option.encoding || 'utf8'
    });
  } catch (ex) {
    console.error(
        chalk.bgRed.bold('When trying to read content of file located: \n  ' +
            path + ' error occurred!\n  ' + ex.message));
    process.exit(1);
  }

  return code;
}

/**
 * 写文件.
 * @param {String} path
 * @param {String|Buffer} data
 * @param {Object} option
 */
function writeFile(path, data, option) {
  try {
    fs.writeFileSync(path, data, {
      encoding: option && option.encoding || ''
    });
  } catch (ex) {
    console.error(
        chalk.bgRed.bold('When trying to write content to file located: \n  ' +
            path + ' error occurred!\n  ' + ex.message));
    process.exit(1);
  }
}

/**
 * 指定的文件是否存在
 * @param {String} filepath
 * @returns {Boolean}
 */
function exist(filepath) {
  return fs.existsSync(filepath);
}


exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.mkdir = mkdir;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.exist = exist;