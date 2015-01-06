// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var UglifyJS = require('uglify-js');
var uglify_config = require(process.cwd() + '/uglify.compress.conf');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var ResourceTable = require('../resource/table');
var Package = require('../resource/package');
var parser = require('./jsDepsParser');
var replacer = require('../replacer/js');
var ModuleManager = require('../module/manager.js');

/**
 * Class deal with script resource
 * @constructor
 * @implements {Resolver}
 */
var ScriptResolver = function() {
  this.options = SOI_CONFIG;
  this.currentPkg = null;
};

utils.inherits(ScriptResolver, Resolver);

/**
 * read all js files and concatenate them
 * helper function used by resolve method
 * @param {Array.<String>} scripts All js files' abs paths
 * @returns {string}
 */
ScriptResolver.prototype.combo = function(scripts) {
  var content = '';
  var pre = ';';
  scripts.forEach(function(filepath) {
    var code;
    if (filepath === this.options.module_loader) {
      code = utils.readFile(path, {
        encoding: this.options.encoding
      });
    } else {
      var mod = ModuleManager.getModuleByPath(filepath);
      if (!mod) {
        throw 'Module located at ' + filepath +
          ' has not been registered globally.';
      }
      code = mod.code;
    }

    // 找到代码中require.async的值
    var urls = replacer.search(code);
    var us = urls.map(function(url) {
      // 得到异步加载模块的绝对路径
      var u = utils.normalizeSysPath(
        path.resolve(path.dirname(filepath), url));
      // 根据绝对路径拿到注册的package
      var need = ResourceTable.getPackageByPath('js', u).dist_file;
      // 根据当前遍历包得到打包后当前包的地址
      var curDir = this.currentPkg.dist_dir;
      // 计算两个包打包后的相对地址
      return utils.normalizeSysPath(path.relative(curDir, need));
    }, this);

    code = replacer.replace(code, urls, us);
    var ast = UglifyJS.parse(code);
    // compressor needs figure_out_scope too
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor(uglify_config);
    ast = ast.transform(compressor);

    // need to figure out scope again so mangler works optimally
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();

    // get Ugly code back :)
    // get compressed code
    code = ast.print_to_string();

    content += pre + code;
    pre = '\n;';
  }, this);
  return content;
};

/**
 * 保存未走到最后一步替换-压缩-合并的package
 * @type {?Array}
 * @private
 */
ScriptResolver.prototype.pendingPkgs_ = null;

/**
 * 添加挂起package最后倒序完成替换-压缩-合并
 * @param {Object} pkg
 * @param {Array} scripts
 * @private
 */
ScriptResolver.prototype.addPendingPackage_ = function(pkg, scripts) {
  if (!this.pendingPkgs_) {
    this.pendingPkgs_ = [];
  }
  this.pendingPkgs_.push({
    pkg: pkg,
    scripts: scripts
  });
};

/**
 * 倒序替换-合并-压缩挂起的包
 * @private
 */
ScriptResolver.prototype.deorder = function() {
  var len = this.pendingPkgs_.length;
  for (var i = len - 1; i >= 0; --i) {
    var obj = this.pendingPkgs_[i],
      pkg = obj.pkg,
      scripts = obj.scripts;

    this.currentPkg = pkg;
    // combo
    var all_code = this.combo(scripts);
    // compress together
    /*(function() {
     var code = utils.readFile(
     utils.normalizeSysPath(path.resolve(SOI_CONFIG.base_dir, './demo/assets/js/app.js')),
     { encoding: 'utf8' });
     var ast = UglifyJS.parse(code);
     ast.figure_out_scope();
     var compressor = UglifyJS.Compressor(uglify_config);
     ast = ast.transform(compressor);
     // need to figure out scope again so mangler works optimally
     ast.figure_out_scope();
     ast.compute_char_frequency();
     ast.mangle_names();

     utils.writeFile(utils.normalizeSysPath(
     path.resolve(SOI_CONFIG.base_dir, SOI_CONFIG.output_file)),
     ast.print_to_string(), {
     encoding: 'utf8'
     }); // get compressed code
     })();*/


    // write to minified file
    var hex = utils.getStringHash(all_code).hex;
    var _jspath_ = pkg.dist_dir + '/' +
      path.basename(pkg.dist_file, constants.JS_FILE_EXT) +
      constants.BUILD_FILENAME_CONNECTOR + hex + constants.JS_FILE_EXT;
    var dir = path.dirname(_jspath_);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    utils.writeFile(_jspath_, all_code, {
      encoding: SOI_CONFIG.encoding
    });

    // register package
    var package = new Package({
      type    : 'js',
      input   : scripts[scripts.length - 1],
      files   : scripts,
      dist_file: _jspath_
    });
    ResourceTable.registerPackage({
      type    : 'js',
      key     : package.input,
      value   : package
    });
  }
};

/**
 * Helper for resolve method.
 * @private
 */
ScriptResolver.prototype.resolve_ = function() {
  // native Array.prototype.forEach will cache array's length then
  // we could not traverse items dynamically added in jsparser.
  for (var i = 0; i < this.options.bundles.js.length; ++i) {
    var pkg = this.currentPkg = this.options.bundles.js[i];
    // calculate the ordered js files
    var scripts = parser.calculate(pkg);
    // if (!pkg.defer) {
    //   scripts.unshift(this.options.module_loader);
    // }

    // print output
    if (this.options.debug) {
      console.log(scripts);
    }

    // 重构: 子系统返回打包序列文件后停止合并压缩, 等待异步依赖的模块合并后再做操作,
    // 由于bundle数组是一个简单栈机制, 所以到达最后一项即可逆序 替换-压缩-合并;
    if (i === this.options.bundles.js.length - 1) {
      // combo
      var all_code = this.combo(scripts);
      // compress together
      /*(function() {
       var code = utils.readFile(
       utils.normalizeSysPath(path.resolve(SOI_CONFIG.base_dir, './demo/assets/js/app.js')),
       { encoding: 'utf8' });
       var ast = UglifyJS.parse(code);
       ast.figure_out_scope();
       var compressor = UglifyJS.Compressor(uglify_config);
       ast = ast.transform(compressor);
       // need to figure out scope again so mangler works optimally
       ast.figure_out_scope();
       ast.compute_char_frequency();
       ast.mangle_names();

       utils.writeFile(utils.normalizeSysPath(
       path.resolve(SOI_CONFIG.base_dir, SOI_CONFIG.output_file)),
       ast.print_to_string(), {
       encoding: 'utf8'
       }); // get compressed code
       })();*/


      // write to minified file
      var hex = utils.getStringHash(all_code).hex;
      var _jspath_ = pkg.dist_dir + '/' +
        path.basename(pkg.dist_file, constants.JS_FILE_EXT) +
        constants.BUILD_FILENAME_CONNECTOR + hex + constants.JS_FILE_EXT;
      var dir = path.dirname(_jspath_);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      utils.writeFile(_jspath_, all_code, {
        encoding: SOI_CONFIG.encoding
      });

      // register package
      var package = new Package({
        type: 'js',
        input: scripts[scripts.length - 1],
        files: scripts,
        dist_file: _jspath_
      });
      ResourceTable.registerPackage({
        type: 'js',
        key: package.input,
        value: package
      });

      this.deorder();
    } else {
      this.addPendingPackage_(pkg, scripts);
      parser.clear();
    }
  }
};

/**
 * calculate module dependency, combo and compress js files
 */
ScriptResolver.prototype.resolve = function () {
  if (!this.options.bundles.js) {
    return;
  }
  this.resolve_();
};

module.exports = ScriptResolver;