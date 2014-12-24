// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var UglifyJS = require('uglify-js');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var ResourceTable = require('../resource/table');
var Package = require('./Package');
var calculate = require('./jsDepsParser');
var uglify_config = require(process.cwd() + '/uglify.compress.conf');


/**
 * Class deal with script resource
 * @constructor
 * @implements {Resolver}
 */
var ScriptResolver = function() {
  this.options = SOI_CONFIG;
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
  scripts.forEach(function(path) {
    var code = fs.readFileSync(path,
      { encoding: this.options.encoding });
    content += ';' + code;
  }, this);
  return content;
};


/**
 * calculate module dependency, combo and compress js files
 */
ScriptResolver.prototype.resolve = function () {
  if (!this.options.bundles.js)
    return;

  this.options.bundles.js.forEach(function(pkg) {
    // calculate sequence of js files
    var scripts = calculate(pkg.input);
    scripts.unshift(this.options.module_loader);

    // print output
    /*
    var str = '';
    scripts = scripts.map(function(jsAbsPath) {
      var rel = utils.normalizeSysPath(
        path.relative(this.options.output_base, jsAbsPath));
      str += constants.PREFIX_SCRIPT_TAG + rel +
        constants.SUFFIX_SCRIPT_TAG + '\n';

      return utils.normalizeSysPath(
        path.relative(this.options.base_dir, jsAbsPath));
    }, this);

    if (this.options.debug) {
      console.log(scripts);
    }

    if (!fs.existsSync(path.dirname(this.options.output_file))) {
      fs.mkdirSync(path.dirname(this.options.output_file));
    }
    utils.writeFile(this.options.output_file, str);*/

    // combo
    var all_code = this.combo(scripts);
    // compress together
    var ast = UglifyJS.parse(all_code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor(uglify_config);
    ast = ast.transform(compressor);
    all_code = ast.print_to_string(); // get compressed code

    // write to minified file
    var hex = utils.getStringHash(all_code).hex;
    var _jspath_ = pkg.dist_dir + '/' +
      path.basename(pkg.dist_file, constants.JS_FILE_EXT) +
      constants.BUILD_FILENAME_CONNECTOR + hex + constants.JS_FILE_EXT;
    var dir = path.dirname(_jspath_);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    utils.writeFile(_jspath_, all_code, { encoding: this.options.encoding });

    // register package
    var package = new Package({
      type    : 'css',
      input   : scripts[scripts.length - 1],
      files   : scripts,
      dist_file: _jspath_
    });
    ResourceTable.registerPackage({
      type    : 'js',
      key     : package.input,
      value   : package
    });

  }, this);
};


module.exports = ScriptResolver;