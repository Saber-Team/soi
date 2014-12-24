// system modules
var fs = require('fs');
var vm = require('vm');


// custom modules
var utils = require('../utils');
var unique = utils.unique;
var ModuleManager = require('../module/manager.js');


// local vars
var tree = {};
var sequence = [];


// todo 可视化输入有向图，对于循环依赖一目了然
// todo 循环依赖的检查
var env = {
  define: function(id, deps, factory) {
    if (!tree[id]) {
      tree[id] = deps;
    }

    if (sequence.indexOf(id) === -1) {
      sequence.push(id);
    }

    deps.forEach(function(depId) {
      if (sequence.indexOf(depId) === -1) {
        var module = ModuleManager.getModule(depId);
        if (!module) {
          console.warn(depId + ' have not been registered!');
        }
        var code = utils.readFile(module.path,
            { encoding: SOI_CONFIG.encoding });
        code = vm.createScript(code);
        code.runInNewContext(env);
      }
    });
  },
  require: function(deps, factory) {
    env.define('anonymous', deps, factory);
  }
};


// build the tree
function constructTree(node) {
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
function calculate(inputModulePath) {
  var code = utils.readFile(inputModulePath,
    { encoding: SOI_CONFIG.encoding });
  code = vm.createScript(code);
  code.runInNewContext(env);

  var visited = constructTree(sequence[0]);

  visited = visited.map(function(id) {
    return ModuleManager.getModule(id).path;
  });

  return visited;
}


// exports
module.exports = calculate;