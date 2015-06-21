/**
 * @fileoverview 资源包和单个资源很不一样，它是合并编译出来的，所以类似与单个资源的key
 *     是无法计算的，相反记住它的入口模块很重要，不论是css还是js。
 */

'use strict';

var path = require('path');
var fs = require('fs');

var utils = require('../utils');
var Resource = require('./resource');
var compiler = require('../Compiler/cssCompiler');


/**
 * 资源包类
 * @constructor
 * @param {Object} config
 */
function Package(config) {
  this.type = config.type;
  this.encoding = config.encoding;
  this.files = config.files;
  // 针对两个虚拟目录的绝对路径
  this.from = this.key = this.entrance = config.from;
  this.to = config.to;
  // 系统中的真实绝对路径
  this.original = null;
  this.dist = config.dist;

  this.getHashId();
}


/**
 * 生成目标文件
 */
Package.prototype.createFile = function() {
  var ext = this.type === 'css' ? '.css' : '.js';

  // 写文件
  soi.fs.mkdir(this.dist);

  var p = this.dist + '/' + this.hashId + ext;
  soi.log.info('Create file located at:\n  ' + p);
  soi.fs.writeFile(p, this.cachedContent);
  // 不存储缓存内容
  delete this.cachedContent;
};


/**
 * 返回当前资源的hash值
 * @return {String}
 */
Package.prototype.getHashId = function() {
  // 唯一名
  var text = compiler.run(this.files);
  this.hashId = utils.getStringHash(text).base64;
  this.cachedContent = text;
  // 事先无法知道to的具体值，在这里更新
  this.to = path.join(path.dirname(this.to), this.hashId + path.extname(this.to));
};


// 导出
module.exports = Package;