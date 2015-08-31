/**
 * @fileoverview swf资源类
 * @author AceMood
 */

'use strict';

var path = require('path');
var fs = require('fs');
var utils = require('../utils');
var ResourceBase = require('./ResourceBase');


/** @constructor */
function SwfResource(config) {
  ResourceBase.call(this, config);
  this.getHashId();
}


utils.inherits(SwfResource, ResourceBase);


/** 生成目标文件 */
SwfResource.prototype.createFile = function() {
  var base = path.basename(this.original);

  // 写入文件
  soi.fs.mkdir(this.dist);

  var p = this.dist + '/' + base;
  soi.log.info('Create file located at:\n  ' + p);

  soi.fs.writeFile(p, this.cachedContent);
  // 不存储缓存内容
  delete this.cachedContent;
};


/**
 * 返回当前资源的hash值
 * @return {String}
 */
SwfResource.prototype.getHashId = function() {
  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.shortHashId = utils.getStringHash(this.from, 5).base64;
  this.cachedContent = ret.content;
  // 事先无法知道to的具体值，在这里更新
  // this.to = soi.utils.normalizeSysPath(
  //   path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));
};


// 导出
module.exports = SwfResource;
