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
var retrieve = require('./retriever');

// local vars
var seen = [];  // lifetime: 遍历一个pkg期间, 保留是否执行过模块
var tree = {};  // lifetime: 遍历一个pkg期间, 保留模块和依赖对应关系
var currentPkg = null;
var currentModulePath = [];


// Script execute environment
// Treated as a [sandbox]
// See: http://nodejs.org/api/vm.html
var ENV = {
  define: function(id, deps, factory) {
    var filepath = currentModulePath[currentModulePath.length - 1];
    // Note: 首次加载的js文件均要创建单个资源记录,
    // 但按需异步加载的模块不会创建单个资源记录, 而是注册资源包package.
    if (ResourceTable.getResource('js', filepath)) {
      return;
    }

    // Module has been registered
    // Note: 所有执行过的模块都需要注册到ModuleManager而不必区分是否异步载入.
    if (ModuleManager.getModuleByPath(filepath)) {
      currentModulePath.pop();
      return;
    }

    // current pkg already look into this file
    if (tree[filepath]) {
      return;
    }

    // deal with mutable arguments
    if (typeof id !== 'string') {
      factory = deps;
      deps = id;
      id = ModuleManager.getAnonymousModuleId(false);
    } else if (id === 'anonymous') {
      id = ModuleManager.getAnonymousModuleId(true);
    }

    if (!utils.isArray(deps)) {
      factory = deps;
      deps = [];
      if (typeof factory !== 'function' && !utils.isObject(factory)) {
        console.log(chalk.bgRed.bold(
            'define a module must provide a factory function' +
            ' or exports object! \nFind in: ' + filepath + ' \n'
        ));
        process.exit(1);
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

    tree[filepath] = deps;
    if (seen.indexOf(filepath) == -1) {
      seen.push(filepath);
    }

    // loop recursion FIRST
    deps.forEach(function(_path) {
      if (seen.indexOf(_path) > -1) {
        return;
      }
      currentModulePath.push(_path);

      var code = utils.readFile(_path, {
        encoding: soi().ENV.config.optimizer.encoding
      });

      // 解析其中的require.async
      add(retrieve(code));

      vm.runInNewContext(code, ENV);
    });

    // create resource & register module
    // do not repeat creating resource
    // if (!ResourceTable.getResource('js', filepath)) {
    //   createResource(filepath);
    // }

    // 所有define过的模块都需要注册
    var mod = new Module({
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

    // maintain and sync the paths track stack
    currentModulePath.pop();
  },
  require: function(deps, factory) {
    ENV.define('anonymous', deps, factory);
  }
};


/**
 * When look in a js file, register as a resource.
 * We move the code from js processor here.
 * @param {String} _path Absolute path of original js file
 * @return {Object}
 */
function createResource(_path) {
  // 对于图片或者swf资源,每个都会被复制到打包文件夹, origin字段方便计算
  // 复制后的相对路径. 但对于css和js这种需要合并的资源, origin字段意义不大
  // 在此都设置为null.
  // create resource instance but without generating any js file
  var resource = Resource.create({
    origin  : null,
    type    : 'js',
    path    : _path,
    encoding: soi().ENV.config.optimizer.encoding,
    dist    : currentPkg.dist_dir
  });

  // register resource table
  ResourceTable.register({
    type    : 'js',
    key     : _path,
    value   : resource
  });

  return resource;
}


// todo 可视化输出有向图结构，对于循环依赖一目了然
// todo 循环依赖的检查，深度优先遍历


/**
 * ordered scripts
 * @param {String} path
 * @returns {Array}
 */
function construct(path) {
  var visited = [];
  function t(deps) {
    visited = visited.concat(deps);
    deps.forEach(function(dep) {
      t(tree[dep] || []);
    });
  }

  visited.push(path);
  t(tree[path] || []);

  unique(visited.reverse());
  visited = visited.filter(function(path) {
    // 首屏未加载模块
    if (!ResourceTable.getResource('js', path)) {
      if (currentPkg.defer) {
        return true;
      }
      createResource(path);
      return true;
    }

    return false;
  });

  return visited;
}

/**
 * Deal with all require.async invocation and add
 * them to bundles.js array.
 * @param {Array.<String>} urls
 */
function add(urls) {
  if (urls.length > 0) {
    // convert to absolute path
    urls = urls.map(function(url) {
      if (url.indexOf(constants.JS_FILE_EXT) === -1) {
        url += constants.JS_FILE_EXT;
      }
      return utils.normalizeSysPath(
        path.resolve(path.dirname(
          currentModulePath[currentModulePath.length - 1]), url));
    }, this);

    urls.forEach(function(url) {
      var exists = soi().ENV.config.optimizer.bundles.js.some(function(target) {
        return target.input === url;
      });
      if (!exists) {
        // dynamically add bundle target.
        soi().ENV.config.optimizer.bundles.js.push({
          input     : url,
          defer     : true,
          dist_file : path.basename(url),
          dist_dir  : soi().ENV.config.optimizer.dist_dir
        });
      }
    }, this);

    // todo todo
  }
}

/**
 * Calculate the dependency sequence according to the
 * logic start module.
 * @param {Object} pkg
 * @returns {*}
 */
function calculate(pkg) {
  currentPkg = pkg;
  var inputModulePath = pkg.input;
  currentModulePath.push(inputModulePath);

  var code = utils.readFile(inputModulePath, {
    encoding: soi().ENV.config.optimizer.encoding
  });

  // 解析其中的require.async
  add(retrieve(code));

  vm.runInNewContext(code, ENV);

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