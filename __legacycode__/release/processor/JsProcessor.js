/**
 * @fileoverview JavaScript处理器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var vm = require('vm');
var glob = require('glob');

var utils = require('../utils');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/ResourceTable');
var Package = require('../resource/Package');
var ENV = require('./ENV');
var analyzer = require('../compiler/jsDependencyAnalyzer');


/**
 * JavaScript处理器
 * @constructor
 */
var ScriptProcessor = function () {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null;
  this.type = 'js';
};


/**
 * 创建资源且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
ScriptProcessor.prototype.process = function (fileName) {
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
    type    : this.type,
    key     : key,
    value   : resource
  });

  // todo 是否现在创建目标文件？此时未经过编译
  // resource.createFile();
};


/**
 * 生成批量文件的文件名
 * @returns {string}
 */
ScriptProcessor.prototype.getUniqueBundleId = function () {
  this.bundleId = (this.bundleId === void 0 ? -1 : this.bundleId) + 1;
  return 'auto_combined_' + this.bundleId;
};


/**
 * 遍历映射路径
 * @param {Object} OPTIONS release任务的配置节点
 */
ScriptProcessor.prototype.traverse = function (OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack.js || this.options.pack.js.length <= 0) {
    return
  }

  //================================
  // todo Here do the replace job
  //================================

  // traverse js pack list
  var pack = this.options.pack.js;
  pack.forEach(function (pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    var fileList = [], entrance;

    // 判断modular字段，支持`amd` 和 传统`normal`两种
    if (pkg.modular === 'amd') {
      if (!pkg.entrance) {
        soi.log.error('Amd modular need an entrance props.');
        process.exit(1)
      }

      entrance = path.normalize(this.options.virtualRootDir + pkg.entrance);
      fileList = analyzer.run([entrance])

    } else {
      pkg.files.forEach(function (item) {
        var pattern = path.normalize(this.options.virtualRootDir + item);
        var files = glob.sync(pattern, {
          root: this.options.virtualRootDir,
          ignore: item.ignore
        });

        // 路径绝对化
        files = files.map(function (p) {
          return path.resolve(p)
        });
        fileList = fileList.concat(files);

      }, this);

      entrance = fileList[fileList.length - 1];
      soi.utils.unique(fileList)
    }

    // 查看文件列表
    // debugger;

    // 创建资源
    fileList.forEach(function (filepath) {
      var _path = path.relative(process.cwd(), filepath);
      this.process(_path)
    }, this);

    // 注册模块
    if (pkg.modular === 'amd') {
      fileList.forEach(function (filepath) {
        // 读文件
        var code = soi.fs.readFile(filepath, {
          encoding: this.options.charset
        });
        ENV.filepath = filepath;
        try {
          vm.runInNewContext(code, ENV);
        } catch (err) {
          soi.log.error('Execute Context Runtime error in ' + filepath);
          process.exit(1)
        }
      }, this)
    }

    // 打包资源的key不同于单个资源, 计算相对于vrd的绝对路径作为资源的key已经毫无意义
    // 自动生成名字
    var key = this.getUniqueBundleId();

    // 计算网络上的绝对路径
    var basename = path.basename(entrance);
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
      modular     : pkg.modular === 'amd',
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
    resource.createFile()

  }, this)
};


// 导出
module.exports = ScriptProcessor;