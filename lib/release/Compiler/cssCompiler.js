'use strict';

// import modules
var path = require('path');
var fs = require('fs');
var css = require('css');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var ResourceTable = require('../resource/table');
var Package = require('../resource/package');
var parser = require('./cssParser');


var codeTree;


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
function compile(startPath, encoding) {
  soi.log.info('css compile file located at: ', startPath);

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
                if (soi.utils.isAbsUrl(url)) {
                  return;
                }
                var u = soi.utils.normalizeSysPath(
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
          /*
          // 禁用滤镜
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
          }*/
        });
      }
    }

    return css.stringify(ast, { compress: true });
  }
}


/**
 * Class deal with css resource.
 * @constructor
 */
var StyleResolver = function() {
  this.options = soi().ENV.config.optimizer;
  this.type = 'css';
  // current resolving pkg in bundles.css items.
  this.currentPkg = null;
};


/**
 * Read all css files and concatenate them
 * helper function used by resolve method
 * @param {Array.<String>} cssFilesArray All css files' abs paths
 * @returns {string}
 */
function combo(cssFilesArray) {
  var content = '';
  cssFilesArray.forEach(function(path, i) {
    content += (i !== 0 ? '\n' : '') + codeTree[path];
  }, this);
  return content;
}


/**
 * According code tree write the file in array to a dist file.
 * @param {Array.<String>} cssFilesArray
 */
StyleResolver.prototype.write2compress = function(cssFilesArray) {
  var cssText = this.combo(cssFilesArray);
  var hex = utils.getStringHash(cssText).hex;
  var _csspath_ = this.currentPkg.dist_dir + '/' +
    path.basename(this.currentPkg.dist_file, constants.CSS_FILE_EXT) +
    constants.FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

  var dir = path.dirname(_csspath_);
  utils.mkdir(dir);
  utils.writeFile(_csspath_, cssText,
    { encoding: this.options.encoding });

  // register package
  var pkg = new Package({
    type      : this.type,
    input     : cssFilesArray[cssFilesArray.length - 1],
    files     : cssFilesArray,
    dist_file : _csspath_
  });
  ResourceTable.registerPackage({
    type      : this.type,
    key       : pkg.input,
    value     : pkg
  });
};


/**
 * Calculate module dependency, combo and compress css files
 */
function run() {
  if (!this.options.bundles.css ||
    this.options.bundles.css.length <=0)
    return;

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