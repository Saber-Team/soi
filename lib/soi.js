/**
 * @fileoverview soi入口程序
 * @author AceMood
 * @email zmike86@gmail.com
 */


'use strict';


// 引用模块
var path = require('path'),
    utils = require('./utils'),
    Plugin = require('./plugin'),
    log = require('./log'),
    fsys = require('./fs');

// 内置功能
var server = require('./server/server'),
    deploy = require('./deploy/deploy'),
    release = require('./release/release');


// 全局单例
var soi_instance;


/**
 * 全局soi函数返回全局唯一单例对象
 * @return {Object}
 */
var soi = function() {
  if (soi_instance)
    return soi_instance;

  soi_instance = createInstance();
  return soi_instance;
};


// 单例工厂
function createInstance() {
  soi_instance = Object.create(null);
  soi_instance.server = function() {
    return server;
  };
  soi_instance.deploy = function(config) {
    if (config) {
      deploy.config(config);
    }
    deploy.post();
  };
  soi_instance.release = function(task) {
    task = task || 'default';
    release.release(task);
  };
  // plugins sequence are important
  soi_instance.use = function(plugin) {
    if (typeof plugin !== 'function') {
      soi.log.error('soi plugin entry point must be a function');
    }
    this.plugins.push({
      entry: plugin,
      isUsed: true
    });
    return soi_instance;
  };
  // drop specified plugin
  soi_instance.drop = function(plugin) {
    if (typeof plugin !== 'function') {
      soi.log.error('soi plugin entry point must be a function');
    }
    var len = this.plugins.length;
    for (var i = 0; i < len; i++) {
      if (this.plugins[i].isUsed && this.plugins[i].entry === plugin) {
        this.plugins[i].isUsed = false;
        break;
      }
    }
    return soi_instance;
  };

  soi_instance.go = function() {
    // cache length execution
    this.plugins.forEach(function(plugin) {
      if (plugin.isUsed) {
        plugin.entry.call(soi_instance, this.ENV.config);
      }
    }, this);
  };
    // clear global soi
    // used for test case
  soi_instance.reset = function() {
    this.plugins.length = 0;
    this.ENV = null;
    soi_instance = null;
  };
    // used or dropped plugins
  soi_instance.plugins = [];
  // 配置环境
  soi_instance.ENV = Object.create(null);
  soi_instance.ENV.config = Object.create(null);

  return soi_instance;
}

/**
 * 加载插件帮助函数
 * @param {string} filepath
 * @private
 */
function load_(filepath) {
  var filename = path.basename(filepath);
  var msg = 'Loading "' + filename + '" plugin locally...';
  var fn;
  try {
    // Load taskfile.
    fn = require(path.resolve(filepath));
    if (typeof fn !== 'function') {
      soi.log.error(filepath, ' export plugin must be an function');
      process.exit(1);
    }
    soi.log.ok(msg);
  } catch(e) {
    // Something went wrong.
    soi.log.error(e.message, '\n', e.stack);
  }
}

// 日志相关函数
soi.log = Object.create(null);
soi.log.error = log.error;
soi.log.info = log.info;
soi.log.ok = log.ok;
soi.log.warn = log.warn;

// S.O.I 配置对象
soi.config = Object.create(null);
soi.config.set = function(key, value) {
  if (!key)
    return;

  var keys = key.split('.');
  var o = soi().ENV.config;
  while (keys.length > 1) {
    o[keys[0]] = o[keys[0]] || Object.create(null);
    o = o[keys[0]];
    keys.shift();
  }
  o[keys[0]] = value;
};
soi.config.extend = function(config) {
  // multiple plugins
  for (var key in config) {
    try {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        // override
        var oldConfigItem = soi().ENV.config[key] || Object.create(null);
        utils.extend(oldConfigItem, config[key], true);
        soi().ENV.config[key] = oldConfigItem;
      }
    } catch (ex) {
      soi.log.error('Trying to merge ' + key +
          ' into config options it failed. \n  ' + ex.message);
      process.exit(1);
    }
  }
};

// 实用函数
soi.utils = Object.create(null);
soi.utils.deepClone = utils.deepClone;
soi.utils.extend = utils.extend;
soi.utils.isArray = utils.isArray;
soi.utils.isObject = utils.isObject;
soi.utils.unique = utils.unique;
soi.utils.readJSON = utils.readJSON;
soi.utils.flatten = utils.flatten;
soi.utils.isAbsUrl = utils.isAbsUrl;
soi.utils.normalizeSysPath = utils.normalizeSysPath;

// fs相关函数
soi.fs = Object.create(null);
soi.fs.isDirectory = fsys.isDirectory;
soi.fs.isFile = fsys.isFile;
soi.fs.mkdir = fsys.mkdir;
soi.fs.readFile = fsys.readFile;
soi.fs.writeFile = fsys.writeFile;
soi.fs.exist = fsys.exist;

// 一些常量
soi.const = Object.create(null);
soi.const.nullFunction =  function() {};
soi.const.version = require('../package.json').version;

// soi的插件注册表
soi.globalPlugins = Object.create(null);

/**
 * API提供给插件使用, 注册插件
 * @param {string} name 插件名
 * @param {function(config:Object)} plugin
 * @param {?Object} options
 */
soi.registerPlugin = function(name, plugin, options) {
  var plugins = soi.globalPlugins;
  if (plugins) {
    if (typeof name !== 'string') {
      soi.log.error(
          'soi.registerPlugin must accept plugin name as a string.');
      process.exit(1);
    }
    if (typeof plugin !== 'function') {
      soi.log.error(
          'soi.registerPlugin must accept plugin self as a function.');
      process.exit(1);
    }
    if (plugins[name]) {
      soi.log.error(
          'soi.globalPlugins already have plugin named ', name, '.');
      process.exit(1);
    }

    soi.globalPlugins[name] = new Plugin({
      name: name,
      entry: plugin,
      meta: options
    });
  }
};

/**
 * Load plugins from a given locally-installed Npm module
 * (installed relative to the base dir).
 * @param {String} name e.g. "soi-optimizer"
 */
soi.loadPlugin = function(name) {
  soi.log.info('"' + name + '" soi plugin');

  var root = path.resolve('node_modules');
  // Process plugins.
  var pluginpath = path.join(root, name, 'lib/index.js');
  // console.log(pluginpath);
  var fn;

  if (soi.fs.exist(pluginpath)) {
    load_(pluginpath);
  } else {
    try {
      // load as global module
      fn = require(name);
      var msg = 'Loading "' + name + '" plugin globally...';
      if (typeof fn !== 'function') {
        soi.log.error(name, ' export plugin must be an function');
        process.exit(1);
      }
      soi.log.ok(msg);
    } catch (err) {
      soi.log.error('Global Npm module "', name,
          '" not found. Is it installed?');
      process.exit(1);
    }
  }
};

/**
 * Given command arg and return all plugins it stands for;
 * @param {string} cmd
 * @return {Array.<Function>}
 */
soi.findPluginsByCommand = function(cmd) {
  var plugins = [];
  if (!cmd) {
    return plugins;
  }
  var pluginnames = Object.keys(soi.globalPlugins);
  // retrieve corresponding plugins
  var needs = pluginnames.filter(function(pn) {
    var plugin = soi.globalPlugins[pn];
    if (plugin && plugin.cmd === cmd) {
      return true;
    }
  });
  needs.forEach(function(pn) {
    var plugin = soi.globalPlugins[pn];
    // todo recursion
    plugin.requires.forEach(function(pn) {
      var plugin = soi.globalPlugins[pn];
      plugins.push(plugin.entry);
    });
    plugins.push(plugin.entry);
  });
  return plugins;
};


// global exports
module.exports = global.soi = soi;