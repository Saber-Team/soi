/**
 * @fileoverview JavaScript处理器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');

var utils = require('../utils');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');
var Package = require('../resource/package');

var analyzer = require('../Compiler/jsDependencyAnalyzer');


/**
 * JavaScript处理器
 * @constructor
 */
var ScriptProcessor = function() {
  this.options = null;
  // 保存当前遍历的pack项目
  this.currentPack = null;
  this.type = 'js';
};


/**
 * 创建资源且生成本地文件
 * @param {String} fileName glob经过计算传入的相对于cwd的文件路径
 */
ScriptProcessor.prototype.process = function(fileName) {
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
    type    : this.type,
    key     : _path,
    value   : resource
  });

  // todo 是否现在创建目标文件？此时未经过编译
  // resource.createFile();

  // register module
  /*
  var code = fs.readFileSync(fileName, { encoding: this.options.encoding });
  code = vm.createScript(code);
  var module = code.runInNewContext(environment);
  module.setPath(path.resolve(fileName));
  ModuleManager.register({
    id      : module.id,
    module  : module
  });
  */
};


/**
 * 生成批量文件的文件名
 * @returns {string}
 */
ScriptProcessor.prototype.getUniqueBundleId = function() {
  this.bundleId = (this.bundleId === void 0 ? -1 : this.bundleId) + 1;
  return 'auto_combined_' + this.bundleId;
};


/**
 * 遍历映射路径
 * @param {Object} OPTIONS release任务的配置节点
 */
ScriptProcessor.prototype.traverse = function(OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack.js || this.options.pack.js.length <= 0)
    return;



  //================================
  // todo Here do the replace job
  //================================



  // traverse js pack list
  var pack = this.options.pack.js;
  pack.forEach(function(pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    var fileList = [], entrance;

    // 判断modular字段，支持`amd` 和 传统`normal`两种
    if (pkg.modular === 'amd') {
      if (!pkg.entrance) {
        soi.log.error('Amd modular need an entrance props.');
        process.exit(1);
      }

      entrance = path.normalize(this.options.virtualRootDir + pkg.entrance);
      fileList = analyzer.run([entrance]);

    } else {
      pkg.files.forEach(function(item) {
        var pattern = path.normalize(this.options.virtualRootDir + item);
        var files = glob.sync(pattern, {
          root: this.options.virtualRootDir,
          ignore: item.ignore
        });

        // 路径绝对化
        files = files.map(function(p) {
          return path.resolve(p);
        });
        fileList = fileList.concat(files);

      }, this);

//      entrance = path.join(this.options.distRootDir,
//          this.currentPack.to,
//          this.getUniqueBundleId());
      entrance = this.getUniqueBundleId();
      soi.utils.unique(fileList);
    }

    // 查看文件列表
    // debugger;

    // 创建资源
    fileList.forEach(function(filepath) {
      var _path = path.relative(process.cwd(), filepath);
      this.process(_path);
    }, this);

    // 取最开始的入口作为资源包的key，因为这个文件开始并没有
    var fileName = entrance;
    // 计算相对于vrd的绝对路径作为资源的key
    var key = soi.utils.normalizeSysPath(
        path.normalize('/' + path.relative(this.options.virtualRootDir, fileName)));

    // 计算相对于drd的绝对路径
    var basename = path.basename(fileName);
    var _path = path.join(this.options.domain, this.currentPack.to, basename);
    var to = soi.utils.normalizeSysPath(path.normalize(_path));

    // debugger;

    // 注册资源包
    var resource = new Package({
      type      : this.type,
      encoding  : this.options.charset,
      from      : key,
      to        : to,
      files     : fileList,
      original  : null,
      dist      : path.resolve(path.join(this.options.distRootDir, this.currentPack.to)),
      modular   : pkg.modular === 'amd'
    });
    ResourceTable.registerPackage({
      type      : this.type,
      key       : key,
      value     : resource
    });

    // 写入文件
    resource.createFile();

  }, this);
};


// 导出
module.exports = ScriptProcessor;