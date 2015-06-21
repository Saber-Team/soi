/**
 * @fileoverview 样式表资源处理器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');

var utils = require('../utils');
var constants = require('../constants');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');
var Package = require('../resource/package');

var analyzer = require('../Compiler/cssDependencyAnalyzer');
var compiler = require('../Compiler/cssCompiler');


/**
 * 处理样式表资源
 * @constructor
 */
var StyleProcessor = function() {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null;
  this.type = 'css';
};


/**
 * 真正的创建资源，且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
StyleProcessor.prototype.process = function(fileName) {
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
    from      : key,
    to        : to,
    original  : path.resolve(fileName),
    dist      : path.resolve(path.join(this.options.distRootDir, this.currentPack.to))
  });

  ResourceTable.register({
    type      : this.type,
    key       : key,
    value     : resource
  });

  // todo 是否现在创建目标文件？此时未经过编译
  // resource.create();

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
    // 当前遍历的pack项目
    this.currentPack = pkg;

    var fileList = [];

    // 当存在entrance字段，说明是依赖自说明的组织方式
    if (pkg.entrance) {
      var entrance = path.normalize(this.options.virtualRootDir + pkg.entrance);
      fileList = analyzer.run([entrance]);
    } else {
      pkg.files.forEach(function(item) {
        var pattern = path.normalize(this.options.virtualRootDir + item);
        var files = glob.sync(pattern, {
          root: this.options.virtualRootDir,
          ignore: item.ignore
        });

        fileList = fileList.concat(analyzer.run(files));
      }, this);

      soi.utils.unique(fileList);
    }

    // 创建资源
    fileList.forEach(function(filepath) {
      var _path = path.relative(process.cwd(), filepath);
      this.process(_path);
    }, this);

    // 编译css
    var cssText = compiler.run(fileList);

    // 写文件
    var hash = utils.getStringHash(cssText).base64;
    var _csspath_ = this.currentPkg.dist_dir + '/' +
        path.basename(this.currentPkg.dist_file, constants.CSS_FILE_EXT) +
        constants.FILENAME_CONNECTOR + hash + constants.CSS_FILE_EXT;

    var dir = path.dirname(_csspath_);
    utils.mkdir(dir);
    utils.writeFile(_csspath_, cssText,
        { encoding: this.options.charset });

    // 注册资源包
    var pkg = new Package({
      type      : this.type,
      input     : cssFilesArray[cssFilesArray.length - 1],
      files     : cssFilesArray,
      dist_file : _csspath_
    });
    ResourceTable.registerPackage({
      type      : this.type,
      key       : pkg.input,
      value     : pkg
    });

  }, this);
};


module.exports = StyleProcessor;