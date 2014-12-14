
// name should be unique Id
var define = function(name, deps, factory) {
    // todo
    return name;
};


// cause entry point file could be unshifted
// so no-name module is ok
var req = function(deps, factory) {
    // todo
    return true;
};


// load module on demand
req.async = function(module_id, callback) {

};


module.exports.require = req;
module.exports.define = define;

