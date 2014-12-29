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

// local vars
var tree = {};
var codes = {};
var currentPkg = null;
var currentModulePath = [];

// script execute environment
var ENV = {
  define: function define(id, deps, factory) {
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

    // loop recursion
    deps.forEach(function(_path) {
      var module = ModuleManager.getModuleByPath(_path);
      if (module) {
        return;
      }
      var code = utils.readFile(_path, {
        encoding: SOI_CONFIG.encoding
      });
      code = vm.createScript(code);
      currentModulePath.push(_path);
      code.runInNewContext(ENV);
    });

    var depsCode = deps.map(function(_path) {
      var mod = ModuleManager.getModuleByPath(_path);
      if (!mod && SOI_CONFIG.debug) {
        console.warn('Module with path: ' + _path +
          'have nor been registered yet!');
      }
      return '"' + mod.id + '"';
    }).join(',');
    var factoryCode = (utils.isObject(factory) ?
      JSON.stringify(factory) : factory.toString());
    codes[currentModulePath[currentModulePath.length - 1]] =
      constants.PREFIX_DEFINE
        .replace('%s', id)
        .replace('%a', depsCode) +
      factoryCode + constants.SUFFIX_DEFINE;

    // CREATE resource & register module
    createResource(currentModulePath[currentModulePath.length - 1]);

    var mod = new Module({
      id      : id,
      deps    : deps,
      factory : factory,
      status  : Module.STATUS.RESOLVED
    });
    mod.setPath(currentModulePath.pop());
    ModuleManager.register({
      id      : id,
      module  : mod
    });

    // deal with factory TODO
    // if (typeof factory === 'function') {
    //   var url = res.getRequireUrl(factoryCode);

    // }
  },
  require: function(deps, factory) {
    ENV.define(deps, factory);
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
  currentModulePath = null;
  tree = {};
  codes = {};
}

// exports
exports.calculate = calculate;
exports.clear = clear;
exports.getCodeTree = function() {
  return codes;
};