/**
 * @fileoverview 模块管理器
 * @email zmike86@gmail.com
 */

'use strict';

var util = require('util');
var Emitter = require('events').EventEmitter;

/**
 * 存储全局模块.
 * @type {object}
 * @private
 */
var __modules__ = Object.create(null);

var uniqueId = 0;

function ModuleManager() {}

util.inherits(ModuleManager, Emitter);


/**
 * 注册模块
 * @param {Module} mod
 */
ModuleManager.register = function (mod) {
  if (__modules__[mod.id]) {
    // todo
  }

  __modules__[mod.id] = mod.module;

  mod.module.emit('register', mod)
};


/**
 * 通过唯一id获取模块
 * @param {String} id
 * @returns {*|null}
 */
ModuleManager.getModuleById = function (id) {
  return __modules__[id] || null
};


/**
 * 根据系统绝对路径获得模块
 * @param {String} path
 * @returns {*}
 */
ModuleManager.getModuleByPath = function (path) {
  for (var n in __modules__) {
    if (__modules__[n].path === path) {
      return __modules__[n]
    }
  }
  return null
};


/**
 * Some module do not have id for example 'require([], function(){})';
 * such condition we generate an anonymous id for it.
 * @param {Boolean} isRequire
 * @returns {string}
 */
ModuleManager.getAnonymousModuleId = function (isRequire) {
  return isRequire ? '@' + (uniqueId++) : '_' + (uniqueId++)
};


/**
 * 返回所有注册过的模块
 * @returns {Object}
 */
ModuleManager.getAll = function () {
  return __modules__
};


/** 清空所有缓存的模块 */
ModuleManager.clear = function () {
  __modules__ = Object.create(null);
  uniqueId = 0
};


/** 打印所有amd模块 */
ModuleManager.print = function () {
  return JSON.stringify(__modules__, 4)
};


// 导出
module.exports = ModuleManager;