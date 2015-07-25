/**
 * @fileoverview
 */

var Module = require('./module');
var ModuleManager = require('./manager');


// name should be unique Id
var define = function(id, deps, factory) {
  // 取得当前文件路径
  var filepath = currentModulePath[currentModulePath.length - 1];

  // Note: 所有执行过的模块都需要注册到ModuleManager而不必区分是否异步载入.
  var mod = ModuleManager.getModuleByPath(filepath);
  /*if (mod) {
   currentModulePath.pop();
   return;
   }*/

  // deal with mutable arguments
  if (typeof id !== 'string') {
    factory = deps;
    deps = id;
    id = ModuleManager.getAnonymousModuleId(false);
  } else if (id === 'anonymous') {
    id = ModuleManager.getAnonymousModuleId(true);
  }

  if (!soi.utils.isArray(deps)) {
    factory = deps;
    deps = [];
    if (typeof factory !== 'function' && !soi.utils.isObject(factory)) {
      soi.log.error(
          'define a module must provide a factory function' +
          ' or exports object! \nFind in: ' + filepath + ' \n');
      process.exit(1);
    }
  }

  // normalize dependency paths
  deps = deps.map(function(dep) {
    if (dep.indexOf(constants.JS_FILE_EXT) === -1) {
      dep += constants.JS_FILE_EXT;
    }
    return soi.utils.normalizeSysPath(
        path.resolve(path.dirname(
            currentModulePath[currentModulePath.length - 1]), dep));
  });

  // 所有define过的模块都需要注册
  if (!mod) {
    mod = new Module({
      id      : id,
      deps    : deps,
      factory : factory,
      status  : Module.STATUS.RESOLVED
    });
    mod.setPath(filepath);
    ModuleManager.register({
      id      : id,
      module  : mod
    });
  }

  // maintain and sync the paths track stack
  currentModulePath.pop();
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

