/**
 * @fileoverview 所有静态资源处理器的基类
 */


'use strict';


var path = require('path');
var fs = require('fs');
var glob = require('glob');

var utils = require('../utils');
var Resource = require('../Resource/resource');
var ResourceTable = require('../resource/table');


/**
 * 图片，字体，swf这种静态资源处理器
 * @constructor
 */
var StaticProcessor = function() {
  this.options = null;
  // current pkg
  this.currentPack = null;
};


/**
 * helper function used by traverse method
 * @param {String} fileName File name of current dealing file
 */
StaticProcessor.prototype.process = function(fileName) {
  // 计算相对于vrd的绝对路径作为资源的key
  var key = soi.utils.normalizeSysPath(
      path.normalize('/' + path.relative(this.options.virtualRootDir, fileName)));

  // 计算相对于drd的绝对路径
  var basename = path.basename(fileName);
  var _path = path.join(this.options.domain, this.currentPack.dist, basename);
  var dist = soi.utils.normalizeSysPath(path.normalize(_path));

  var resource = Resource.create({
    type    : this.type,
    path    : key,
    encoding: this.options.charset,
    dist    : dist
  });
  ResourceTable.register({
    type    : this.type,
    key     : key,
    value   : resource
  });
};


/**
 * 遍历映射路径
 */
StaticProcessor.prototype.traverse = function(OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack[this.type] ||
    this.options.pack[this.type].length <= 0)
    return;

  // traverse img pkg list
  var pack = this.options.pack[this.type];
  pack.forEach(function(pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    pkg.files.forEach(function(item) {
      var stat = path.normalize(this.options.virtualRootDir + item);
      var files = glob.sync(stat, {
        root: this.options.virtualRootDir,
        ignore: this.options.ignore
      });
      files.forEach(function(file) {
        debugger;
        this.process(file);
      }, this);

    }, this);

  }, this);
};


// 导出
module.exports = StaticProcessor;