/**
 * @fileoverview 作为全局js代码执行的上下文对象
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var Module = require('../compiler/module');
var ModuleManager = require('../compiler/manager');
var constants = require('../constants');
var ResourceTable = require('../resource/ResourceTable');

var g = this;

// name should be unique Id
var define = function (id, deps, factory) {
  // 取得当前文件路径
  var filepath = g.filepath;

  // Note: 所有执行过的模块都需要注册到ModuleManager而不必区分是否异步载入.
  var mod = ModuleManager.getModuleByPath(filepath);
  // 定义过的模块跳过
  if (mod) {
    return;
  }

  var resource = ResourceTable.getResourceByAbsolutePath('js', filepath);
  if (!resource) {
    soi.log.error(
        'define a module must after it have been related to a resource.' +
        '\nFind in: ' + filepath + ' \n');
  }

  // 处理形参
  if (typeof id !== 'string') {
    factory = deps;
    deps = id;
    id = resource.shortHashId;
  } else if (id === 'anonymous') {
    id = '@' + resource.shortHashId;
  }
  /*
  if (typeof id !== 'string') {
    factory = deps;
    deps = id;
    id = ModuleManager.getAnonymousModuleId(false);
  } else if (id === 'anonymous') {
    id = ModuleManager.getAnonymousModuleId(true);
  }*/

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

  // 以下代码需要和kerneljs运行时代码一致。
  // 类似于内置依赖注入的require，exports，module都需要加入计算，
  // 否则生成代码会有问题
  if (!deps.length && (typeof factory === 'function')) {
    deps = [];
    // Remove comments from the callback string,
    // look for require calls, and pull them into the dependencies,
    // but only if there are function args.
    if (factory.length) {
      factory
        .toString()
        .replace(constants.commentRegExp, '')
        .replace(constants.cjsRequireRegExp, function (match, quote, dep) {
          deps.push(dep);
        });

      // May be a CommonJS thing even without require calls, but still
      // could use exports, and module. Avoid doing exports and module
      // work though if it just needs require.
      // REQUIRES the function to expect the CommonJS variables in the
      // order listed below.
      deps = (factory.length === 1 ?
        ['require'] : ['require', 'exports', 'module']).concat(deps);
    }
  }

  // normalize dependency paths
  deps = deps.map(function (dep) {
    if (/^(require|exports|module)$/.test(dep)) {
      return dep;
    }
    if (dep.indexOf(constants.JS_FILE_EXT) === -1) {
      dep += constants.JS_FILE_EXT;
    }
    return soi.utils.normalizeSysPath(
        path.resolve(path.dirname(filepath), dep));
  });

  // 所有define过的模块都需要注册
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
};


var req = function (deps, factory) {
  define('anonymous', deps, factory);
};


// load module on demand
req.async = function(moduleId, callback) {
  // css url
  // js url
};


// 导出
exports.require = req;
exports.define = define;