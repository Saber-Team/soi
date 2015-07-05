/**
 * @fileoverview 脚本资源类
 */

'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');

var utils = require('../utils');
var Resource = require('./resource');


/**
 * JavaScript资源.
 * @constructor
 */
function JsResource(config) {
  Resource.call(this, config);
  this.getHashId();
}


util.inherits(JsResource, Resource);


/**
 * 生成目标文件
 */
JsResource.prototype.create = function() {
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
JsResource.prototype.getHashId = function() {
  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.cachedContent = ret.content;
  // 事先无法知道to的具体值，在这里更新
  this.to = path.join(path.dirname(this.to), this.hashId + path.extname(this.to));

  // 不存储缓存内容 todo
  delete this.cachedContent;
};


// 导出
module.exports = JsResource;