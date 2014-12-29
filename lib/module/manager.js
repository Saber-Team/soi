// This module only for javascript files.
// One js file represents a module


/**
 * Store global modules.
 * @type {{}}
 * @private
 */
var __modules__ = Object.create(null);

var uniqueId = 0;

function ModuleManager() {}

// add module
ModuleManager.register = function(mod) {
  if (__modules__[mod.id]) {
    // todo
  }

  __modules__[mod.id] = mod.module;
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

// some module do not have id for example 'require([], function(){})';
// such condition we generate an anonymous id for it.
ModuleManager.getAnonymousModuleId = function() {
  return '$$' + (uniqueId++);
};

ModuleManager.getAll = function() {
  return __modules__;
};

ModuleManager.clear = function() {
  __modules__ = {};
};

module.exports = ModuleManager;