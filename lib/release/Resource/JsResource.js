/**
 * @fileoverview 脚本资源类
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');

var utils = require('../utils');
var ResourceBase = require('./ResourceBase');


/**
 * JavaScript资源.
 * @constructor
 */
function JsResource (config) {
  ResourceBase.call(this, config);
  this.getHashId();
}

util.inherits(JsResource, ResourceBase);


/**
 * 生成目标文件
 */
JsResource.prototype.createFile = function () {
  /*
   var ext = path.extname(this.original);

   // make directory
   soi.fs.mkdir(this.dist);

   var p = this.dist + '/' + this.hashId + ext;
   soi.log.info('Create file located at:\n  ' + p);
   soi.fs.writeFile(p, this.cachedContent);

   // 不存储缓存内容
   delete this.cachedContent;
   */
};


/**
 * 返回当前资源的hash值
 * @return {String}
 */
JsResource.prototype.getHashId = function () {
  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.shortHashId = utils.getStringHash(this.from, 5).base64;
  this.cachedContent = ret.content;
  // 事先无法知道to的具体值，在这里更新
  this.to = soi.utils.normalizeSysPath(
      path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));

  // 不存储缓存内容 todo
  delete this.cachedContent;
};


// 导出
module.exports = JsResource;