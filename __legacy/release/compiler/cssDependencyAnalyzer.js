/**
 * @fileoverview 分析css中的依赖树，产出一份无序去重的文件列表。
 *     分析器不会改变css源代码，甚至去掉import语句，这部分工作在compiler里面做。
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var css = require('css');

var utils = require('../utils');
var res = require('./cssUrlRegExps');

// local vars
var tree = {};
var seen = [];


/**
 * 根据入口分析依赖文件.
 * @param {String} startPath 相对cwd的路径 或 相对系统的绝对路径
 * @param {String} encoding 文件编码，默认utf8
 */
function loop(startPath, encoding) {
  encoding = encoding || 'utf8';
  // 转化成绝对路径
  var absStartPath = path.resolve(startPath);

  soi.log.info('Analyzing css file located at: ', absStartPath);

  // file has been parsed
  if (seen.indexOf(absStartPath) > -1) {
    return;
  }

  seen.push(absStartPath);

  // 读文件
  var content = soi.fs.readFile(absStartPath, { encoding: encoding });
  var ast = css.parse(content);

  // stylesheet is the root node returned by css.parse.
  if (ast.stylesheet && ast.stylesheet.rules) {
    var deps = [];
    for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
      var rule = ast.stylesheet.rules[i];
      // import
      if (rule.type === 'import') {
        // 取得依赖模块路径
        var _path = res.getImportUrl(rule.import)[0];
        // 计算其绝对路径
        var dir = path.dirname(absStartPath);
        _path = soi.utils.normalizeSysPath(path.resolve(dir, _path));

        // 方便起见, deps中保存绝对路径
        deps.push(_path);
      }
    }

    if (!tree[absStartPath]) {
      tree[absStartPath] = deps;
    }

    deps.forEach(function(startPath) {
      loop(startPath, encoding);
    });
  }
}


/**
 * 创建依赖分析树，产出文件列表
 * @param {String} node 入口文件的绝对路径
 * @returns {Array}
 */
function constructTree(node) {
  var visited = [];
  function t(deps) {
    // 'cause will reverse
    // here first reverse it [a,b] -> [b,a]
    deps = deps.reverse();
    visited = visited.concat(deps);
    deps.forEach(function(dep) {
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
function reset() {
  tree = {};
  seen = [];
}


/**
 * 计算css模块依赖
 * @param {Array.<String>} entry 包含入口文件的数组
 */
function run(entry) {
  var fileList = [];

  // 清除上次分析结果
  reset();

  // 遍历每个入口文件，传入相对cwd的路径
  entry.forEach(function(fileName) {
    loop(fileName, 'utf8');
    fileList = fileList.concat(constructTree(seen[0]));
  });

  soi.utils.unique(fileList);

  // debugger;
  return fileList;
}


// 导出
exports.run = run;
exports.reset = reset;