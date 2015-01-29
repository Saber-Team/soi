var util = require('util');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var chalk = require('chalk');
var constants = require('./constants');
var base = require('../utils');


/**
 * 取文件内容hash值
 * @param {String} path
 * @param {?String} encoding
 * @returns {{content: *, hex: string}}
 */
function getFileHash(path, encoding) {
  var shasum1 = crypto.createHash('sha1');
  var ctn = fs.readFileSync(path,
    {
      encoding: encoding ? encoding : ''
    });

  shasum1.update(ctn);
  return {
    content: ctn,
    hex: shasum1.digest('hex').substr(0,
      Math.min(soi().ENV.config.sha1_length || 8, 40))
  }
}

/**
 * 获取内容的hash值
 * @param {String} str
 * @returns {{content: *, hex: string}}
 */
function getStringHash(str) {
  var shasum1 = crypto.createHash('sha1');
  shasum1.update(str);
  return {
    content: str,
    hex: shasum1.digest('hex').substr(0,
      Math.min(soi().ENV.config.sha1_length || 8, 40))
  }
}

/**
 * Read file content.
 * @param {String} path
 * @param {Object} option
 * @returns {*}
 */
function readFile(path, option) {
  try {
    var code = fs.readFileSync(path, {
      encoding: option && option.encoding || ''
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
 * Write content to file.
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

/**
 * 生成代码替换打包模块
 * @param {String} id
 * @param {String} depsCode
 * @param {String} factoryCode
 */
function compose(id, depsCode, factoryCode) {
  // 这里不使用String.prototype.replace是因为对于一些可能出现在代码里的
  // 特殊表示如$$ $'之类的会被js引擎错误解析, 见es62 String部分.
  var tpl, parts;
  if (id.indexOf('@') === 0) {
    tpl = constants.REQUIRE;
    parts = tpl.split('%a');
    tpl = parts[0] + depsCode + parts[1];
    parts = tpl.split('%f');
    tpl = parts[0] + factoryCode + parts[1];
  } else {
    tpl = constants.DEFINE;
    parts = tpl.split('%s');
    tpl = parts[0] + id + parts[1];
    parts = tpl.split('%a');
    tpl = parts[0] + depsCode + parts[1];
    parts = tpl.split('%f');
    tpl = parts[0] + factoryCode + parts[1];
  }
  return tpl;
}

exports.deepClone = base.deepClone;
exports.extend = base.extend;
exports.isArray = base.isArray;
exports.isObject = base.isObject;
exports.inherits = util.inherits;
exports.unique = base.unique;
exports.isDirectory = base.isDirectory;
exports.isFile = base.isFile;
exports.getFileHash = getFileHash;
exports.getStringHash = getStringHash;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.isAbsUrl = base.isAbsUrl;
exports.normalizeSysPath = base.normalizeSysPath;
exports.mkdir = base.mkdir;
exports.compose = compose;