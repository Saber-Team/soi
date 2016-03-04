/**
 * @fileoverview 分析JavaScript源码生成的依赖树，产出一份有序去重的文件列表。
 *     分析器不会改变js源代码，这部分工作在compiler里面做。
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var vm = require('vm');
var path = require('path');

// custom modules
var utils = require('../utils');
var unique = utils.unique;
var constants = require('../constants');
var Module = require('./module');
var Resource = require('../resource/resource');

// local vars
var seen = [];  // lifetime: 遍历一个pkg期间, 保留是否执行过模块
var tree = {};  // lifetime: 遍历一个pkg期间, 保留模块和依赖对应关系
var currentModulePath = [];


/**
 * 根据入口分析依赖文件.
 * @param {String} startPath 相对cwd的路径 或 相对系统的绝对路径
 * @param {String} encoding 文件编码，默认utf8
 */
function loop (startPath, encoding) {
  encoding = encoding || 'utf8';
  // 转化成绝对路径
  var absStartPath = path.resolve(startPath);

  soi.log.info('Analyzing javascript file located at: ', absStartPath);

  // file has been parsed
  if (seen.indexOf(absStartPath) > -1) {
    return;
  }

  seen.push(absStartPath);

  // 记录当前之行代码的js文件路径
  currentModulePath.push(absStartPath);

  // 读文件
  var content = soi.fs.readFile(absStartPath, { encoding: encoding });
  vm.runInNewContext(content, ENV);
}


// 脚本执行环境，见: http://nodejs.org/api/vm.html
var ENV = {
  define: function (id, deps, factory) {
    // 取得当前文件路径
    var filepath = currentModulePath[currentModulePath.length - 1];

    // 当前遍历周期内已经执行过此模块
    if (tree[filepath]) {
      return;
    }

    // 处理形参
    if (typeof id !== 'string') {
      factory = deps;
      deps = id;
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

    // 以下代码不需要和kerneljs运行时代码一致。
    // 类似于内置依赖注入的require，exports，module都不需要真正加入计算
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
      }
    }

    // normalize dependency paths
    deps = deps.map(function (dep) {
      if (dep.indexOf(constants.JS_FILE_EXT) === -1) {
        dep += constants.JS_FILE_EXT;
      }
      return soi.utils.normalizeSysPath(
        path.resolve(path.dirname(
          currentModulePath[currentModulePath.length - 1]), dep));
    });

    // 记录依赖关系
    tree[filepath] = deps;

    // 记录遍历与否
    if (seen.indexOf(filepath) === -1) {
      seen.push(filepath);
    }

    // loop recursion FIRST
    deps.forEach(function(_path) {
      loop(_path);
    });

    // maintain and sync the paths track stack
    currentModulePath.pop();
  },
  require: function (deps, factory) {
    ENV.define('anonymous', deps, factory);
  }
};


// todo 可视化输出有向图结构，对于循环依赖一目了然
// todo 循环依赖的检查，深度优先遍历


/**
 * 创建依赖分析树，产出文件列表
 * @param {string} node 入口文件的绝对路径
 * @returns {Array}
 */
function constructTree (node) {
  var visited = [];
  function t (deps) {
    // 'cause will reverse
    // here first reverse it [a,b] -> [b,a]
    deps = deps.reverse();
    visited = visited.concat(deps);
    deps.forEach(function (dep) {
      t(tree[dep] || []);
    });
  }

  visited.push(node);
  t(tree[node] || []);

  soi.utils.unique(visited.reverse());
  return visited;
}


/**
 * 清除上次分析结果
 */
function reset () {
  currentModulePath = [];
  tree = {};
  seen = [];
}


/**
 * 计算模块依赖
 * @param {Array.<String>} entry 包含入口文件的数组
 */
function run (entry) {
  var fileList = [];

  // 清除上次分析结果
  reset();

  // 遍历每个入口文件，传入相对cwd的路径
  entry.forEach(function (fileName) {
    loop(fileName, 'utf8');
    fileList = fileList.concat(constructTree(seen[0]));
  });

  soi.utils.unique(fileList);

  return fileList;
}


// 导出
exports.run = run;
exports.reset = reset;