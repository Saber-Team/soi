/**
 * @fileoverview 样式表处理器
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
var Package = require('../resource/Package');

var analyzer = require('../compiler/cssDependencyAnalyzer');


/**
 * 处理样式表资源
 * @constructor
 */
var StyleProcessor = function () {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null;
  this.type = 'css';
};


/**
 * 真正的创建资源，且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
StyleProcessor.prototype.process = function (fileName) {
  // 计算相对于vrd的绝对路径作为资源的key
  var key = soi.utils.normalizeSysPath(
      path.normalize('/' + path.relative(this.options.virtualRootDir, fileName)));

  // 计算网络上的绝对路径
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
  // resource.createFile();

};


/**
 * 生成批量文件的文件名
 * @returns {string}
 */
StyleProcessor.prototype.getUniqueBundleId = function () {
  this.bundleId = (this.bundleId === void 0 ? -1 : this.bundleId) + 1;
  return 'auto_combined_' + this.bundleId;
};


/**
 * 遍历映射路径
 * @param {Object} OPTIONS release任务的配置节点
 */
StyleProcessor.prototype.traverse = function (OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack.css || this.options.pack.css.length <= 0)
    return;

  // traverse css pack list
  var pack = this.options.pack.css;
  pack.forEach(function(pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    var fileList = [], entrance;

    // 当存在entrance字段，说明是依赖自说明的组织方式
    if (pkg.modular) {
      if (!pkg.entrance) {
        soi.log.error('Css modular need an entrance props.');
        process.exit(1);
      }

      entrance = path.normalize(this.options.virtualRootDir + pkg.entrance);
      fileList = analyzer.run([entrance]);

    } else {
      pkg.files.forEach(function (item) {
        var pattern = path.normalize(this.options.virtualRootDir + item);
        var files = glob.sync(pattern, {
          root: this.options.virtualRootDir,
          ignore: item.ignore
        });

        // 路径绝对化
        files = files.map(function (p) {
          return path.resolve(p);
        });
        fileList = fileList.concat(files);

      }, this);

      entrance = fileList[fileList.length - 1];
      soi.utils.unique(fileList);
    }

    // 创建资源
    fileList.forEach(function (filepath) {
      var _path = path.relative(process.cwd(), filepath);
      this.process(_path);
    }, this);

    // 取最开始的入口作为资源包的key，因为这个文件开始并没有
    var fileName = entrance;

    // 打包资源的key不同于单个资源, 计算相对于vrd的绝对路径作为资源的key已经毫无意义
    // 自动生成名字
    var key = this.getUniqueBundleId();

    // 计算网络上的绝对路径
    var basename = path.basename(fileName);
    var _path = path.join(this.options.domain, this.currentPack.to, basename);
    var to = soi.utils.normalizeSysPath(path.normalize(_path));

    // debugger;

    // 注册资源包
    var resource = new Package({
      type        : this.type,
      encoding    : this.options.charset,
      key         : key,
      from        : fileList,
      to          : to,
      original    : null,
      dist        : path.resolve(path.join(this.options.distRootDir, this.currentPack.to)),
      modular     : pkg.modular,
      placeholder : pkg.placeholder || '',
      obscure     : this.options.obscure,
      replacer    : this.options.replace
    });
    ResourceTable.registerPackage({
      type        : this.type,
      key         : key,
      value       : resource
    });

    // 写入文件
    resource.createFile();

  }, this);
};


module.exports = StyleProcessor;