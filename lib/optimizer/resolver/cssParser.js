// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');

// Custom
var utils = require('../utils');
var unique = utils.unique;
var res = require('./cssUrlRes');
var ResourceTable = require('../resource/table');
var Resource = require('../resource/resource');

// local vars
var currentPkg = null;
var tree = {};
var codes = {};
var seen = [];

/**
 * When look in a css file, register as a resource.
 * We move the code from css processor module.
 * @param {String} _path absolute path of original css file
 */
function createResource(_path) {
  // 对于图片或者swf资源,每个都会被复制到打包文件夹, origin字段方便计算
  // 复制后的相对路径. 但对于css和js这种需要合并的资源, origin字段意义不大
  // 在此都设置为null.

  // Create resource instance but without generating any style sheets,
  // because all style files are high recommended to be bundled into one.
  var resource = Resource.create({
    origin    : null,
    type      : 'css',
    path      : _path,
    encoding  : soi().ENV.config.optimizer.encoding,
    dist      : currentPkg.dist_dir
  });

  // register resource table
  ResourceTable.register({
    type    : 'css',
    key     : _path,
    value   : resource
  });
}

/**
 * Start from a module file to parse its deps.
 * @param {String} startPath Absolute module file path.
 * @param {String} encoding file encoding
 */
function loop(startPath, encoding) {
  // file has been parsed
  if (seen.indexOf(startPath) > -1) {
    return;
  }

  seen.push(startPath);

  if (currentPkg.defer &&
    ResourceTable.getResource('css', startPath) !== null) {
    return;
  }

  // only create resource on first view bundle,
  // all bundles loaded on demand will be independent with
  // each other so that the file needed by more than two
  // bundles will include it independently.
  if (!currentPkg.defer) {
    createResource(startPath);
  }

  // read entry point file
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
 * we could provide a way to reset all calc.
 * Or just for test.
 */
function clear() {
  currentPkg = null;
  tree = {};
  codes = {};
  seen = [];
}

// export
exports.loop = loop;
exports.parse = parse;
exports.clear = clear;
exports.createResource = createResource;
exports.setCurrentPackage = function(pkg) {
  currentPkg = pkg;
};
exports.getCurrentPackage = function() {
  return currentPkg;
};
exports.getCodeTree = function() {
  return codes;
};