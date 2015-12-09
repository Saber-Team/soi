/**
 * @fileoverview 所有静态资源处理器的基类
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');
var utils = require('../utils');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/ResourceTable');


/**
 * 图片，字体，swf这种静态资源处理器
 * @constructor
 */
var StaticProcessor = function () {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null
};


/**
 * 真正的创建资源，且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
StaticProcessor.prototype.process = function (fileName) {
  // 计算相对于vrd的绝对路径作为资源的key
  var key = soi.utils.normalizeSysPath(
      path.normalize('/' + path.relative(this.options.virtualRootDir, fileName)));

  // 计算相对于drd的绝对路径
  var basename = path.basename(fileName);
  var _path = path.join(this.options.domain, this.currentPack.to, basename);
  var to = soi.utils.normalizeSysPath(path.normalize(_path));

  // 创建资源同时要
  // 1. 计算系统中的物理地址
  // 2. 计算移入目录绝对路径
  var resource = Resource.create({
    type      : this.type,
    encoding  : this.options.charset,
    from      : key, // 本地地址
    to        : to,  // 线上地址
    original  : path.resolve(fileName),
    dist      : path.resolve(path.join(this.options.distRootDir, this.currentPack.to))
  });

  ResourceTable.register({
    type      : this.type,
    key       : key,
    value     : resource
  });

  resource.createFile(this.options)
};


/** 遍历映射路径 */
StaticProcessor.prototype.traverse = function (OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack[this.type] ||
    this.options.pack[this.type].length <= 0)
    return;

  // 遍历
  var pack = this.options.pack[this.type];
  pack.forEach(function (pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    pkg.files.forEach(function (item) {
      var pattern = path.normalize(this.options.virtualRootDir + item);
      var files = glob.sync(pattern, {
        root: this.options.virtualRootDir,
        ignore: item.ignore
      });

      files.forEach(function(file) {
        // 创建文件并注册资源表
        this.process(file)
      }, this)

    }, this)

  }, this)
};


// 导出
module.exports = StaticProcessor;