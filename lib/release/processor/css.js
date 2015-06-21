/**
 * @fileoverview 样式表资源处理器
 */

'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');

var utils = require('../utils');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');


/**
 * 处理样式表资源
 * @constructor
 */
var StyleProcessor = function() {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null;


  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};


/**
 * 真正的创建资源，且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
StyleProcessor.prototype.process = function(fileName) {
  // absolute path of original css file
  var _path = utils.normalizeSysPath(path.resolve(base, fileName));

  // get the css relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  // Create resource instance but without generating any style sheets,
  // because all style files are high recommended to be bundled into one.
  var resource = Resource.create({
    origin  : origin,
    type    : 'css',
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });

  // register resource table
  ResourceTable.register({
    type    : 'css',
    key     : _path,
    value   : resource
  });
};


/**
 * 遍历映射路径
 */
StyleProcessor.prototype.traverse = function(OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack.css || this.options.pack.css.length <= 0)
    return;

  // traverse css pack list
  var pack = this.options.pack.css;
  pack.forEach(function(pkg) {
    var entrance = pkg.entrance;
    // 当前遍历的pack项目
    this.currentPack = pkg;
    // 当存在entrance字段，说明是依赖自说明的组织方式
    // 把编译过程推迟到 css resolver --> css parser
    // TODO: Shall we parse import statments to register modules here?
    if (entrance) {
      return;
    }

    pkg.files.forEach(function(item) {
      var pattern = path.normalize(this.options.virtualRootDir + item);
      var files = glob.sync(pattern, {
        root: this.options.virtualRootDir,
        ignore: item.ignore
      });
      files.forEach(function(file) {
        debugger;
        this.process(file);
      }, this);

    }, this);

  }, this);
};


module.exports = StyleProcessor;