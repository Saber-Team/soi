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
var constants = require('../constants');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');
var ModuleManager = require('../module/manager');
var environment = require('../env');

var vm = require('vm');
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

  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};


/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing script file
 * @param {String} fileName File name of current dealing script file
 */
ScriptProcessor.prototype.process = function(base, fileName) {
  // absolute path of original js file
  var _path = utils.normalizeSysPath(path.resolve(base, fileName));

  // skip module loader
  // because it also provide global require & define method
  // which could be affect the environment context.
  if (_path === this.options.module_loader)
    return;

  // get the js relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  // create resource instance but without generating any js file
  var resource = Resource.create({
    origin  : origin,
    type    : 'js',
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });

  // register resource table
  ResourceTable.register({
    type    : 'js',
    key     : _path,
    value   : resource
  });

  // register module
  var code = fs.readFileSync(_path, { encoding: this.options.encoding });
  code = vm.createScript(code);
  var module = code.runInNewContext(environment);
  module.setPath(_path);
  ModuleManager.register({
    id      : module.id,
    module  : module
  });
};


/**
 * 遍历映射路径
 * @param {Object} OPTIONS release任务的配置节点
 */
ScriptProcessor.prototype.traverse = function(OPTIONS) {
  this.options = OPTIONS;

  if (!this.options.pack.js || this.options.pack.js.length <= 0)
    return;

  // traverse js pack list
  var pack = this.options.pack.css;
  pack.forEach(function(pkg) {
    // 当前遍历的pack项目
    this.currentPack = pkg;

    var fileList = [], entrance;

    // 当存在entrance字段，说明是依赖自说明的组织方式
    if (pkg.entrance) {
      entrance = path.normalize(this.options.virtualRootDir + pkg.entrance);
      fileList = analyzer.run([entrance]);
    }
    /* todo
     else {
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
    */

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

    debugger;

    // because we use unique moduleId for each module in source code,
    // so we must scan all the file first, it's very different with
    // form of requirejs, but we concern the chance of path changing of module
    // and reduce complexity of unit tests of oslo source code.
    // directly register module
    pkg.files.forEach(function(file) {
      // store the list item of js config now
      this.currentFilesItem = file;
      var stat = fs.lstatSync(this.options.base_dir + file);
      if (stat.isFile() && file.indexOf(constants.JS_FILE_PATH) === file.length - 3) {
        this.process(this.options.base_dir, file);
      } else if (stat.isDirectory()) {
        var dir = path.resolve(this.options.base_dir, file);
        var walker = new Walker({
          dirname: dir
        });
        walker.walk(this.process.bind(this));
      }
    }, this);
  }, this);
};


module.exports = ScriptProcessor;