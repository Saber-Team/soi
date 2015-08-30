'use strict';

var util = require('util');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var constants = require('./constants');


/**
 * 取文件内容hash值
 * @param {String} path 文件路径
 * @param {?String} encoding 文件内容编码
 * @param {Number} length 唯一码长度，默认是9
 * @returns {{content: *, hex: string}}
 */
function getFileHash (path, encoding, length) {
  var shasum1 = crypto.createHash('sha1');
  var ctn = fs.readFileSync(path,
    {
      encoding: encoding ? encoding : ''
    });

  shasum1.update(ctn);
  var base64 = shasum1.digest('base64')
      .replace(/\//g, '_')
      .substr(0, length || 9);

  return {
    content: ctn,
    base64: base64
  }
}


/**
 * 获取内容的hash值
 * @param {String} str
 * @param {Number} length 唯一码长度，默认是9
 * @returns {{content: *, hex: string}}
 */
function getStringHash (str, length) {
  var shasum1 = crypto.createHash('sha1');

  shasum1.update(str);
  var base64 = shasum1.digest('base64')
      .replace(/\//g, '_')
      .substr(0, length || 9);

  return {
    content: str,
    base64: base64
  }
}


/**
 * 生成代码替换打包模块
 * @param {String} id
 * @param {String} depsCode
 * @param {String} factoryCode
 */
function compose (id, depsCode, factoryCode) {
  // 这里不使用String.prototype.replace是因为对于一些可能出现在代码里的
  // 特殊表示如$$ $'之类的会被js引擎错误解析, 见es62 String部分.
  var tpl, parts;
  if (id.indexOf('@') === 0) {
    tpl = constants.REQUIRE;
    parts = tpl.split('%a');
    tpl = parts[0] + depsCode + parts[1];
    parts = tpl.split('%f');
    tpl = parts[0] + factoryCode + parts[1];
    tpl = 'require' + tpl;
  } else {
    tpl = constants.DEFINE;
    parts = tpl.split('%s');
    tpl = parts[0] + id + parts[1];
    parts = tpl.split('%a');
    tpl = parts[0] + depsCode + parts[1];
    parts = tpl.split('%f');
    tpl = parts[0] + factoryCode + parts[1];
    tpl = 'define' + tpl;
  }
  return tpl;
}


// 导出
exports.inherits = util.inherits;
exports.getFileHash = getFileHash;
exports.getStringHash = getStringHash;
exports.compose = compose;
exports.resolveResourceType = function (filename) {
  if (constants.RE_IMG_FILE_EXT.test(filename)) {
    return 'img';
  }
  if (constants.RE_SWF_FILE_EXT.test(filename)) {
    return 'swf';
  }
  if (constants.RE_FONT_FILE_EXT.test(filename)) {
    return 'font';
  }
  if (constants.RE_HTC_FILE_EXT.test(filename)) {
    return 'htc';
  }
};