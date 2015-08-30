/**
 * @fileoverview 每个AMD模块都有各自维护的一套属性，
 *   在本模块将其抽象出来
 * @email zmike86@gmail.com
 * @author AceMood
 */

'use strict';

// Built-in
var util = require('util');
var fs = require('fs');
var Emitter = require('events').EventEmitter;

// Custom
var utils = require('../utils');
var ModuleManager = require('./manager');
var kerneljsDotUrl = require('../kerneljs/resolve-url');


/**
 * 代表一个amd规范的模块.
 * @constructor
 */
function Module (config) {
  this.id = config.id;
  this.path = '';
  this.deps = config.deps;
  this.factory = config.factory;
  this.status = config.status;

  this.buildCode();
  // this.exports = null;
}

util.inherits(Module, Emitter);

/**
 * 设置模块路径
 * @param {String} path
 */
Module.prototype.setPath = function (path) {
  var exists = soi.fs.exist(path);
  if (!exists) {
    soi.log.error('As required module id: ' + this.id + ', ' +
        path + ' file not exists!');
    process.exit(1);
  }
  this.path = path
};


/**
 * 编译模块的代码便于合并压缩
 * 无手写id此时会被添加
 */
Module.prototype.buildCode = function () {
  var depsCode = this.deps.map(function (_path) {
    if (/^(require|exports|module)$/.test(_path)) {
      return '"' + _path + '"'
    }
    var mod = ModuleManager.getModuleByPath(_path);
    if (!mod) {
      console.warn('Module with path: ' + _path +
        'have nor been registered yet!')
    }
    return '"' + mod.id + '"'
  }).join(',');

  var factoryCode = '';
  if (soi.utils.isObject(this.factory)) {
    factoryCode = JSON.stringify(this.factory)
  } else {
    // 解析资源定位函数
    factoryCode = this.factory.toString()
    factoryCode = kerneljsDotUrl.run(factoryCode, function (url) {
      if (soi.utils.isAbsUrl(url)) {
        return url
      }

      // 取得资源绝对路径
      debugger;
      var u = soi.utils.normalizeSysPath(
          path.resolve(path.dirname(this.path), url));

      // 获取模块id
      var mod = ModuleManager.getModuleByPath(u);
      if (!mod) {
        console.warn('Module with path: ' + u +
            'have nor been registered yet!');
      }
      return mod.id;
    });
  }

  this.code = utils.compose(this.id, depsCode, factoryCode)
};


/**
 * @enum {number}
 */
Module.STATUS = {
  INIT    : 0,  // defining...
  PARSING : 1,  // look for "require.async"
  RESOLVED: 2,  // factory code be resolved
  READY   : 3   // registered, can be imported by others
};


module.exports = Module;