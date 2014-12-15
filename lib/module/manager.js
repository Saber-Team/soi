
/**
 * Store global modules.
 * @type {{}}
 * @private
 */
var __modules__ = {};


function ModuleManager() {

}


ModuleManager.register = function(mod) {
    if (__modules__[mod.id]) {
        // todo
    }

    __modules__[mod.id] = mod.module;
};


ModuleManager.getModule = function(id) {
    return __modules__[id] || null;
};


ModuleManager.clear = function() {
    __modules__ = {};
};
