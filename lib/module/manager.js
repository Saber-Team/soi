var util = require('util');
var Emitter = require('events').EventEmitter;

/**
 * Store global modules.
 * @type {{}}
 * @private
 */
var __modules__ = Object.create(null);

var uniqueId = 0;

function ModuleManager() {}

util.inherits(ModuleManager, Emitter);

// add module
ModuleManager.register = function(mod) {
  if (__modules__[mod.id]) {
    // todo
  }

  __modules__[mod.id] = mod.module;

  mod.module.emit('register', mod);
};

// get module through unique id
ModuleManager.getModuleById = function(id) {
  return __modules__[id] || null;
};

// get module through file system path
ModuleManager.getModuleByPath = function(path) {
  for (var n in __modules__) {
    if (__modules__[n].path === path) {
      return __modules__[n];
    }
  }
  return null;
};

/**
 * Some module do not have id for example 'require([], function(){})';
 * such condition we generate an anonymous id for it.
 * @param {Boolean} isRequire
 * @returns {string}
 */
ModuleManager.getAnonymousModuleId = function(isRequire) {
  return isRequire ? '@' + (uniqueId++) : '_' + (uniqueId++);
};

ModuleManager.getAll = function() {
  return __modules__;
};

ModuleManager.clear = function() {
  __modules__ = {};
};

module.exports = ModuleManager;