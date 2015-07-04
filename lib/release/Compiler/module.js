// Built-in
var util = require('util');
var fs = require('fs');
var Emitter = require('events').EventEmitter;
var chalk = require('chalk');

// Custom
var utils = require('../utils');
var constants = require('../constants');
var ModuleManager = require('./manager');

/**
 * Represent a single module.
 * @constructor
 */
function Module(config) {
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
Module.prototype.setPath = function(path) {
  var exists = fs.existsSync(path);
  if (!exists) {
    console.log(chalk.bgRed.bold(
        'As required module id: ' + this.id + ', ' + path + ' file not exists!'
    ));
    process.exit(1);
  }
  this.path = path;
};

/**
 * 编译模块的代码便于合并压缩
 * 无手写id此时会被添加
 */
Module.prototype.buildCode = function() {
  var depsCode = this.deps.map(function(_path) {
    var mod = ModuleManager.getModuleByPath(_path);
    if (!mod) {
      console.warn('Module with path: ' + _path +
        'have nor been registered yet!');
    }
    return '"' + mod.id + '"';
  }).join(',');

  var factoryCode = (utils.isObject(this.factory) ?
    JSON.stringify(this.factory) : this.factory.toString());

  this.code = utils.compose(this.id, depsCode, factoryCode);
};

/**
 * @enum
 */
Module.STATUS = {
  INIT    : 0,  // defining...
  PARSING : 1,  // look for "require.async"
  RESOLVED: 2,  // factory code be resolved
  READY   : 3   // registered, can be imported by others
};


module.exports = Module;