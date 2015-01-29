// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var chalk = require('chalk');
var UglifyJS = require('uglify-js');
//var uglify_config = require(process.cwd() + '/uglify.compress.conf');
var uglify_config = require('../conf/conf-uglify');


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
  this.options = soi().ENV.config.optimizer;
  this.currentPkg = null;
};

utils.inherits(ScriptResolver, Resolver);

/**
 * Read all js files and concatenate them
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
      code = utils.readFile(filepath, {
        encoding: this.options.encoding
      });
    } else {
      var mod = ModuleManager.getModuleByPath(filepath);
      if (!mod) {
        console.log(chalk.bgRed.bold(
            'Module located at ' + filepath +
            ' has not been registered globally.'
        ));
        process.exit(1);
      }
      code = mod.code;
      // 找到代码中require.async的值
      var urls = replacer.search(code);
      var us = urls.map(function(url) {
        if (url.indexOf(constants.JS_FILE_EXT) === -1) {
          url += constants.JS_FILE_EXT;
        }
        // 得到异步加载模块的绝对路径
        var u = utils.normalizeSysPath(
          path.resolve(path.dirname(filepath), url));

        var mod = ModuleManager.getModuleByPath(u);
        var rsc;
        if (mod !== null) {
          rsc = ResourceTable.getResource('js', mod.path);
          // first view registered
          if (rsc !== null) {
            return mod.id;
          }
        }

        // 根据绝对路径拿到注册的package
        var package = ResourceTable.getPackageByPath('js', u);
        if (package === null) {
          debugger;
        }
        var need = package.dist_file;
        // 根据当前遍历包得到打包后当前包的地址
        var curDir = this.currentPkg.dist_dir;
        // 计算两个包打包后的相对地址
        // 当前目录加上 './' 是为了适应模块加载器默认配置对于toplevel的路径
        // 解析的逻辑
        var rel = utils.normalizeSysPath(path.relative(curDir, need));
        if (path.dirname(rel) === '.')
          rel = './' + rel;
        return rel;
      }, this);

      if (urls.length) {
        code = replacer.replace(code, urls, us);
      }
    }

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
 * 倒序执行替换-合并-压缩挂起的包
 * @private
 */
ScriptResolver.prototype.deorder = function() {
  if (!this.pendingPkgs_)
    return;

  var len = this.pendingPkgs_.length;
  for (var i = len - 1; i >= 0; --i) {
    var obj = this.pendingPkgs_[i];
    this.currentPkg = obj.pkg;
    this.write2compress(obj.scripts);
  }

  if (this.options.debug) {
    ResourceTable.print();
  }
};

/**
 * According code tree write the file in array to a dist file.
 * @param {Array.<String>} jsFilesArray
 */
ScriptResolver.prototype.write2compress = function(jsFilesArray) {
  if (!jsFilesArray || jsFilesArray.length === 0) {
    return;
  }
  // combo
  var all_code = this.combo(jsFilesArray);
  // write to minified file
  var hex = utils.getStringHash(all_code).hex;
  var _jspath_ = utils.normalizeSysPath(
    path.join(
      this.currentPkg.dist_dir,
      path.basename(this.currentPkg.dist_file, constants.JS_FILE_EXT) +
      constants.FILENAME_CONNECTOR + hex + constants.JS_FILE_EXT
    ));
  var dir = path.dirname(_jspath_);
  utils.mkdir(dir);
  utils.writeFile(_jspath_, all_code, {
    encoding: this.options.encoding
  });

  // register package
  var package = new Package({
    type      : 'js',
    input     : jsFilesArray[jsFilesArray.length - 1],
    files     : jsFilesArray,
    dist_file : _jspath_
  });
  ResourceTable.registerPackage({
    type      : 'js',
    key       : package.input,
    value     : package
  });
};

/**
 * calculate module dependency, combo and compress js files
 */
ScriptResolver.prototype.resolve = function () {
  if (!this.options.bundles.js) {
    return;
  }
  // native Array.prototype.forEach will cache array's length then
  // we could not traverse items dynamically added in jsparser.
  for (var i = 0; i < this.options.bundles.js.length; ++i) {
    var pkg = this.currentPkg = this.options.bundles.js[i];
    // calculate the ordered js files
    var scripts = parser.calculate(pkg);

    if (i === 0) {
      scripts.unshift(this.options.module_loader);
    }

    // 重构: 子系统返回打包序列文件后停止合并压缩, 等待异步依赖的模块合并后再做操作,
    // 由于bundle数组是一个简单栈机制, 所以到达最后一项即可逆序 替换-压缩-合并;
    if (i === this.options.bundles.js.length - 1) {
      this.write2compress(scripts);
      this.deorder();
    } else {
      this.addPendingPackage_(pkg, scripts);
      parser.clear();
    }
  }
};

// export
module.exports = ScriptResolver;

// compress together
/*(function() {
 var code = utils.readFile(
 utils.normalizeSysPath(path.resolve(soi().ENV.config.optimizer.base_dir, './demo/assets/js/app.js')),
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
 path.resolve(soi().ENV.config.optimizer.base_dir, soi().ENV.config.optimizer.output_file)),
 ast.print_to_string(), {
 encoding: 'utf8'
 }); // get compressed code
 })();*/