/**
 * @fileoverview 分析css中的依赖树，产出一份无序去重的文件列表
 */

'use strict';

var path = require('path');
var fs = require('fs');
var css = require('css');

var utils = require('../utils');
var unique = soi.utils.unique;
var res = require('./cssUrlRes');
var ResourceTable = require('../resource/table');
var Resource = require('../resource/resource');

// local vars
var currentPkg = null;
var tree = {};
var codes = {};
var seen = [];


/**
 * 根据入口分析依赖文件.
 * @param {String} startPath 相对cwd的路径
 * @param {String} encoding 文件编码，默认utf8
 */
function loop(startPath, encoding) {
  // 转化成绝对路径
  startPath = path.resolve(startPath);
  soi.log.info('Analyzing css file located at: ', startPath);

  // file has been parsed
  if (seen.indexOf(startPath) > -1) {
    return;
  }

  seen.push(startPath);

  if (ResourceTable.getResource('css', startPath) !== null) {
    return;
  }

  // only create resource on first view bundle,
  // all bundles loaded on demand will be independent with
  // each other so that the file needed by more than two
  // bundles will include it independently.
  if (!currentPkg.defer) {
    createResource(startPath);
  }

  // 读文件
  var content = utils.readFile(startPath, { encoding: encoding });
  var ast = css.parse(content);

  // stylesheet is the root node returned by css.parse.
  if (ast.stylesheet && ast.stylesheet.rules) {
    var deps = [];
    for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
      var rule = ast.stylesheet.rules[i];
      // import
      if (rule.type === 'import') {
        var _path = res.getImportUrl(rule.import)[0];
        var dir = path.dirname(startPath);
        var absPath = utils.normalizeSysPath(path.resolve(dir, _path));
        if (!currentPkg.defer ||
            (ResourceTable.getResource('css', absPath) === null)) {
          deps.push(absPath);
        }
        // remove
        ast.stylesheet.rules.splice(i, 1);
        i--;
      }
      // web font
      else if (rule.type === 'font-face') {
        rule.declarations.forEach(function(declaration) {
          var ret;
          if (declaration.property === 'src') {
            ret = res.getWebFonts(declaration.value);
            if (ret.length) {
              ret.forEach(function(url) {
                // only deal with top-level path and relative path
                if (utils.isAbsUrl(url)) {
                  return;
                }
                var u = utils.normalizeSysPath(
                    path.resolve(path.dirname(startPath), url));
                // get the final path
                var p = ResourceTable.getResource('font', u).distPath;
                // calc the relative path to dist combo file
                var f = utils.normalizeSysPath(
                    path.relative(path.dirname(
                            currentPkg.dist_dir + '/' + currentPkg.dist_file), p));

                declaration.value = declaration.value.replace(url, f);
              });
            }
          }
        });
      }
      // other properties may contains src or url
      else if (rule.type === 'rule') {
        rule.declarations.forEach(function(declaration) {
          var ret;
          // todo modify declaration.position.end.column
          // url("../img/a.png") no-repeat;
          // border-image:url(../img/a.png) 30 30 round;
          if (res.BACKGROUND_IMAGE.test(declaration.property) ||
              res.BORDER_IMAGE.test(declaration.property)) {
            ret = res.getBgImages(declaration.value);
            if (ret.length) {
              ret.forEach(function(url) {
                // only deal with top-level path and relative path
                if (utils.isAbsUrl(url)) {
                  return;
                }
                var u = utils.normalizeSysPath(
                    path.resolve(path.dirname(startPath), url));
                // get the final path
                var p = ResourceTable.getResource('img', u).distPath;
                // calc the relative path to dist combo file
                var f = utils.normalizeSysPath(
                    path.relative(path.dirname(
                            currentPkg.dist_dir + '/' + currentPkg.dist_file), p));

                declaration.value = declaration.value.replace(url, f);
              });
            }
          }
          // htc file refer
          if (res.BEHAVIOR.test(declaration.property)) {
            ret = res.getHTCs(declaration.value);
            if (ret.length) {
              ret.forEach(function(url) {
                // only deal with top-level path and relative path
                if (utils.isAbsUrl(url)) {
                  return;
                }
                var u = utils.normalizeSysPath(
                    path.resolve(path.dirname(startPath), url));
                // get the final path
                var p = ResourceTable.getResource('htc', u).distPath;
                // calc the relative path to dist combo file
                var f = utils.normalizeSysPath(
                    path.relative(path.dirname(
                            currentPkg.dist_dir + '/' + currentPkg.dist_file), p));

                declaration.value = declaration.value.replace(url, f);
              });
            }
          }

          if (res.FILTER.test(declaration.property)) {
            ret = res.getFilters(declaration.value);
            if (ret.length) {
              ret.forEach(function(url) {
                // only deal with top-level path and relative path
                if (utils.isAbsUrl(url)) {
                  return;
                }
                // relative from app.html
                var u = utils.normalizeSysPath(
                    path.resolve(soi().ENV.config.optimizer.output_base, url));
                // get the final path
                var p = ResourceTable.getResource('img', u).distPath;
                // calc the relative path to dist combo file
                var f = utils.normalizeSysPath(
                    path.relative(soi().ENV.config.optimizer.output_base
                        + '/', p));

                declaration.value = declaration.value.replace(url, f);
              });
            }
          }
        });
      }
    }

    codes[startPath] = css.stringify(ast, { compress: true });

    if (!tree[startPath]) {
      tree[startPath] = deps;
    }
    deps.forEach(function(absPath) {
      loop(absPath, encoding);
    });
  }
}

// build the tree
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

  unique(visited.reverse());
  return visited;
}

/**
 * Calculate css module dependency
 * @param {Object} pkg package in bundles.css array.
 * @return {Array.<String>} Return
 */
function parse(pkg) {
  currentPkg = pkg;
  if (pkg.input) {
    loop(pkg.input, soi().ENV.config.optimizer.encoding);
    return constructTree(seen[0]);
  }
}


/**
 * Calculate module dependency, combo and compress css files
 * @param {Array.<String>} entry 包含入口文件的数组
 */
function run(entry) {
  // 遍历每个入口文件，传入相对cwd的路径
  entry.forEach(function(file) {
    loop(file, 'utf8');
    return constructTree(seen[0]);
  });


  parser.clear();

  this.options.bundles.css.forEach(function(pkg) {
    this.currentPkg = pkg;
    // If has `css_entry_point` means it's a self
    // dependency calculated code-style, @import used in
    // key file. If not present, we do nothing;
    if (pkg.input) {
      var cssFilesArray = parser.parse(pkg);
      codeTree = parser.getCodeTree();
      this.write2compress(cssFilesArray);
      parser.clear();
    }
    // Else we consider it an file array without any
    // dependency relative. So we bundle them together.
    else {
      codeTree = {};
      var files = [];
      // generate code tree.
      pkg.files.forEach(function(file) {
        var p = utils.normalizeSysPath(
            path.resolve(this.options.base_dir, file));
        files.push(p);
        parser.setCurrentPackage(pkg);
        parser.createResource(p);
        parser.loop(p, this.options.encoding);
        codeTree = parser.getCodeTree();
      }, this);
      this.write2compress(files);
    }
  }, this);
}

// 导出
exports.run = run;