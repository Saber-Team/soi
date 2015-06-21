var util = require('util');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var constants = require('./constants');


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
  var base64 = shasum1.digest('base64').substr(0, 9);

  return {
    content: ctn,
    //hex: shasum1.digest('hex'),
    base64: base64
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
  var base64 = shasum1.digest('base64').substr(0, 9);

  return {
    content: str,
    //hex: shasum1.digest('hex'),
    base64: base64
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
    tpl = soi().ENV.config.optimizer.global_require + tpl;
  } else {
    tpl = constants.DEFINE;
    parts = tpl.split('%s');
    tpl = parts[0] + id + parts[1];
    parts = tpl.split('%a');
    tpl = parts[0] + depsCode + parts[1];
    parts = tpl.split('%f');
    tpl = parts[0] + factoryCode + parts[1];
    tpl = soi().ENV.config.optimizer.global_define + tpl;
  }
  return tpl;
}


exports.inherits = util.inherits;
exports.getFileHash = getFileHash;
exports.getStringHash = getStringHash;
exports.compose = compose;