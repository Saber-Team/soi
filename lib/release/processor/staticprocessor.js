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
  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};


/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing file
 * @param {String} fileName File name of current dealing file
 */
StaticProcessor.prototype.process = function(base, fileName) {
  // absolute path of original file
  var _path = utils.normalizeSysPath(
    path.resolve(base, fileName));
  // get the relative path to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  var resource = Resource.create({
    origin  : origin,
    type    : this.type,
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });
  ResourceTable.register({
    type    : this.type,
    key     : _path,
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
    // 要移入的目录
    this.currentDistDir = pkg.dist;

    pkg.files.forEach(function(item) {
      // store the list item of current config
      this.currentFilesItem = item;
      var stat = path.normalize(this.options.virtualRootDir + item);
      var files = glob.sync(stat, {
        root: this.options.virtualRootDir,
        ignore: this.options.ignore
      });
      files.forEach(function(file) {
        debugger;
        this.process(this.options.base_dir, file);
      });

    }, this);

  }, this);
};


// 导出
module.exports = StaticProcessor;