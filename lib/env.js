
var Module = require('./module/module');
var ModuleManager = require('./module/manager');


// name should be unique Id
var define = function(id, deps, factory) {
  var config = {
    id      : id,
    deps    : deps,
    factory : factory,
    status  : Module.STATUS.RESOLVED
  };

  return new Module(config);
};


// cause entry point file could be unshifted
// so no-name module is ok
var req = function(deps, factory) {
  // 不做全局导出
  var config = {
    id      : ModuleManager.getAnonymousModuleId(),
    deps    : deps,
    factory : factory,
    status  : Module.STATUS.RESOLVED
  };

  return new Module(config);
};


// load module on demand
req.async = function(moduleId, callback) {
  // css url
  // js url
  req.push(moduleId);
};

req.list = [];


exports.require = req;
exports.define = define;

