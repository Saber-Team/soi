// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var parser = require('./cssParser');


var codeTree;


/**
 * Class deal with css resource
 * @constructor
 * @implements {Resolver}
 */
var StyleResolver = function() {
  this.options = SOI_CONFIG;
};


utils.inherits(StyleResolver, Resolver);


/**
 * read all css files and concatenate them
 * helper function used by resolve method
 * @param {Array.<String>} cssFilesArray All css files' abs paths
 * @returns {string}
 */
StyleResolver.prototype.combo = function(cssFilesArray) {
    var content = '';
    cssFilesArray.forEach(function(path) {
        content += codeTree[path];
    }, this);
    return content;
};


/**
 * calculate module dependency, combo and compress css files
 */
StyleResolver.prototype.resolve = function() {
  if (!this.options.bundles.css)
    return;

  this.options.bundles.css.forEach(function(pkg) {
    // If has `css_entry_point` means it's a self
    // dependency calculated code-style, @import used in
    // key file. If not present, we only walk through
    // pkg.files;
    if (pkg.input) {
      var cssFilesArray = parser.parse(pkg);
      codeTree = parser.getCodeTree();
      var cssText = this.combo(cssFilesArray);
      var hex = utils.getStringHash(cssText).hex;
      var _csspath_ = pkg.dist_dir + '/' +
        path.basename(pkg.dist_file, constants.CSS_FILE_EXT) +
        constants.BUILD_FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

      var dir = path.dirname(_csspath_);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      utils.writeFile(_csspath_, cssText,
        { encoding: this.options.encoding });

    } else {

    }
    parser.clear();
  }, this);
};


module.exports = StyleResolver;