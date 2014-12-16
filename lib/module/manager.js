// This module only for javascript files.
// One js file represents a module


/**
 * Store global modules.
 * @type {{}}
 * @private
 */
var __modules__ = {};


var uniqueId = 0;


function ModuleManager() {

}


// add module
ModuleManager.register = function(mod) {
    if (__modules__[mod.id]) {
        // todo
    }

    __modules__[mod.id] = mod.module;
};


// get module through unique id
ModuleManager.getModule = function(id) {
    return __modules__[id] || null;
};


// some module do not have id for example 'require([], function(){})';
// such condition we generate an anonymous id for it.
ModuleManager.getAnonymousModuleId = function() {
    return 'anonymous';
    // 'oslo_module_' + (uniqueId++);
};


ModuleManager.clear = function() {
    __modules__ = {};
};


module.exports = ModuleManager;