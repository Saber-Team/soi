
var Module = require('./module/module.js');


// name should be unique Id
var define = function(name, deps, factory) {
    var config = {
        id      : name,
        deps    : deps,
        status  : Module.STATUS.RESOLVED
    };

    return new Module(config);
};


// cause entry point file could be unshifted
// so no-name module is ok
var req = function(deps, factory) {
    // 不做全局导出
    // todo
    return null;
};


// load module on demand
req.async = function(module_id, callback) {

};


exports.require = req;
exports.define = define;

