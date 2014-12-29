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
var Package = require('../resource/package');
var parser = require('./jsDepsParser');
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
  var codeTree = parser.getCodeTree();
  var content = '';
  scripts.forEach(function(path) {
    var code = codeTree[path];
    if (!code) {
      code = utils.readFile(path, {
        encoding: this.options.encoding
      });
    }
    content += '\n;' + code;
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
    var scripts = parser.calculate(pkg);
    scripts.unshift(this.options.module_loader);

    // print output
    if (SOI_CONFIG.debug) {
      console.log(scripts);
    }

    // combo
    var all_code = this.combo(scripts);
    if (!fs.existsSync(path.dirname(this.options.output_file))) {
      fs.mkdirSync(path.dirname(this.options.output_file));
    }
    utils.writeFile(this.options.output_file, all_code);
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

  }, this);
};

module.exports = ScriptResolver;