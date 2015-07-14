/**
 * @fileoverview 资源包和单个资源很不一样，它是合并编译出来的，所以类似与单个资源的key
 *     是无法计算的，相反记住它的入口模块很重要，不论是css还是js。
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');

var utils = require('../utils');
var cssCompiler = require('../compiler/cssCompiler');
var jsCompiler = require('../compiler/jsCompiler');
var amdCompiler = require('../compiler/jsAMDCompiler');


/**
 * 资源包类
 * @constructor
 * @param {Object} config
 */
function Package(config) {
  this.type = config.type;
  this.encoding = config.encoding || 'utf8';
  this.key = config.key;
  // 针对两个虚拟目录的绝对路径
  this.from = config.from;
  this.to = config.to;
  // 系统中的真实绝对路径
  this.original = null;
  this.dist = config.dist;
  // 是否模块化方案
  this.modular = config.modular;
  // 定位tpl中替换的位置
  this.placeholder = config.placeholder || '';
  // 是否需要压缩混淆代码
  this.obscure = !!config.obscure;

  this.getHashId(config.replacer || {});
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
 * @param {Object} replacer
 * @return {String}
 */
Package.prototype.getHashId = function(replacer) {
  var compiler, text;
  if (this.type === 'css') {
    compiler = cssCompiler;
  } else if (this.type === 'js') {
    compiler = this.modular ? amdCompiler : jsCompiler;
  }

  // debugger;

  // 得到编译后的代码
  text = compiler.run(this.from, {
    obscure: this.obscure,
    encoding: this.encoding,
    replacer: replacer
  });

  // 唯一名
  this.hashId = utils.getStringHash(text).base64;
  this.cachedContent = text;

  // 事先无法知道to的具体值，在这里更新
  this.to = soi.utils.normalizeSysPath(
      path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));
};


// 导出
module.exports = Package;