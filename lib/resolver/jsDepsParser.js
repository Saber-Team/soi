// system modules
var fs = require('fs');
var vm = require('vm');
var path = require('path');

// custom modules
var utils = require('../utils');
var unique = utils.unique;
var constants = require('../constants');
var ModuleManager = require('../module/manager.js');
var Module = require('../module/module');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');
var res = require('./jsRequireRes');
var todo = require('./todo');

// local vars
var seen = [];  // 生命周期: 遍历一个pkg期间, 保留是否执行过模块
var tree = {};  // 生命周期: 遍历一个pkg期间, 保留模块和依赖对应关系
var currentPkg = null;
var currentModulePath = [];


/**
 * deal with factory contains "require.async code"
 * @param {String} id
 * @param {Array.<String>} deps
 * @param {Function|Object} factory
 */
function retrieveAsync(id, deps, factory) {
  if (typeof factory === 'function') {
    var factoryCode = factory.toString();
    factoryCode = res.removeComments(factoryCode);

    var urls = res.getRequireUrls(factoryCode);
    if (urls.length > 0) {
      // convert to absolute path
      urls = urls.map(function(url) {
        return utils.normalizeSysPath(
          path.resolve(path.dirname(
            currentModulePath[currentModulePath.length - 1]), url));
      }, this);

      urls.forEach(function(url) {
        var exists = SOI_CONFIG.bundles.js.some(function(target) {
          return target.input === url;
        });
        if (!exists) {
          // dynamically add bundle target.
          SOI_CONFIG.bundles.js.push({
            input     : url,
            defer     : true,
            dist_file : path.basename(url),
            dist_dir  : SOI_CONFIG.dist_dir
          });
        }
      }, this);

      // todo todo
    }
  }
}

// script execute environment
var ENV = {
  define: function define(id, deps, factory) {
    // Module has been registered
    if (ModuleManager.getModuleByPath(
      currentModulePath[currentModulePath.length - 1]))
    {
      currentModulePath.pop();
      return;
    }

    // current pkg already look into this file
    if (tree[currentModulePath[currentModulePath.length - 1]]) {
      return;
    }

    if (typeof id !== 'string') {
      factory = deps;
      deps = id;
      id = ModuleManager.getAnonymousModuleId();
    }

    if (!utils.isArray(deps)) {
      factory = deps;
      deps = [];
      if (typeof factory !== 'function' && !utils.isObject(factory)) {
        throw 'define a module must provide a factory function' +
          ' or exports object!\nFind in: ' +
          currentModulePath[currentModulePath.length - 1];
      }
    }

    // normalize dependency paths
    deps = deps.map(function(dep) {
      if (dep.indexOf(constants.JS_FILE_EXT) === -1) {
        dep += constants.JS_FILE_EXT;
      }
      return utils.normalizeSysPath(
        path.resolve(path.dirname(
          currentModulePath[currentModulePath.length - 1]), dep));
    });

    tree[currentModulePath[currentModulePath.length - 1]] = deps;
    if (seen.indexOf(currentModulePath[currentModulePath.length - 1]) == -1)
    {
      seen.push(currentModulePath[currentModulePath.length - 1]);
    }

    // loop recursion FIRST
    deps.forEach(function(_path) {
      if (seen.indexOf(_path) > -1) {
        return;
      }
      var code = utils.readFile(_path, {
        encoding: SOI_CONFIG.encoding
      });
      code = vm.createScript(code);
      currentModulePath.push(_path);
      code.runInNewContext(ENV);
    });

    // CREATE resource & register module
    // do not repeat creating resource
    if (!ResourceTable.getResource('js',
      currentModulePath[currentModulePath.length - 1]))
    {
      createResource(currentModulePath[currentModulePath.length - 1]);
    }
    var mod = new Module({
      id      : id,
      deps    : deps,
      factory : factory,
      status  : Module.STATUS.RESOLVED
    });
    mod.setPath(currentModulePath[currentModulePath.length - 1]);
    ModuleManager.register({
      id      : id,
      module  : mod
    });

    // deal with factory contains "require.async code"
    retrieveAsync(id, deps, factory);

    currentModulePath.pop();
  },
  require: function(deps, factory) {
    ENV.define("anonymous", deps, factory);
  }
};


/**
 * When look in a css file, register as a resource.
 * We move the code from css processor module.
 * @param {String} path absolute path of original css file
 */
function createResource(_path) {
  // get the js relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(SOI_CONFIG.base_dir + this.currentFilesItem));

  // create resource instance but without generating any js file
  var resource = Resource.create({
    origin  : origin,
    type    : 'js',
    path    : _path,
    encoding: SOI_CONFIG.encoding,
    dist    : currentPkg.dist_dir
  });

  // register resource table
  ResourceTable.register({
    type    : 'js',
    key     : _path,
    value   : resource
  });
}

// todo 可视化输入有向图，对于循环依赖一目了然
// todo 循环依赖的检查


// build the tree
function construct(node) {
  var visited = [];
  function t(deps) {
    visited = visited.concat(deps);
    deps.forEach(function(dep) {
      t(tree[dep] || []);
    });
  }

  visited.push(node);
  t(tree[node] || []);

  unique(visited.reverse());
  return visited;
}

// Calculate the dependency sequence according to the
// logic start module.
function calculate(pkg) {
  currentPkg = pkg;
  var inputModulePath = pkg.input;
  var code = utils.readFile(inputModulePath, {
    encoding: SOI_CONFIG.encoding
  });
  code = vm.createScript(code);
  currentModulePath.push(inputModulePath);
  code.runInNewContext(ENV);

  // finish loop
  return construct(inputModulePath);
}

/**
 * we could provide a way to reset all calc.
 * Or just for test.
 */
function clear() {
  currentPkg = null;
  currentModulePath = [];
  tree = {};
  seen = [];
}

// exports
exports.calculate = calculate;
exports.clear = clear;
exports.ENV = ENV;