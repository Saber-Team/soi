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
 * @param soi_config
 * @constructor
 * @implements {Resolver}
 */
var StyleResolver = function(soi_config) {
  this.options = soi_config;
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
        var code = codeTree[path];
        content += '\n' + code;
    }, this);
    return content;
};


/**
 * calculate module dependency, combo and compress css files
 */
StyleResolver.prototype.resolve = function() {
// todo css hint

  // If has `css_entry_point` field means it's a self
  // dependency calculated code-style, @import used in
  // key file. If not present, we only walk through
  // files.css;
  if (this.options.css_entry_point) {
    var cssFilesArray = parser.parse(this.options);
    codeTree = parser.codes;
    var cssText = this.combo(cssFilesArray);
    // concatenate all files
    // var cssText = rework(content)
    //    .use(imprt({
    //        encoding: this.options.encoding,
    //        path: path.resolve(this.options.base_dir, this.options.files.css[0])
    //    }))
    //    .toString();
    // .toString({ compress: true });


    var hex = utils.getStringHash(cssText).hex;
    var _csspath_ = this.options.dist_dir + '/' +
        path.dirname(this.options.dist_css_file) + '/' +
        path.basename(this.options.dist_css_file, constants.CSS_FILE_EXT) +
        constants.BUILD_FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

    var dir = path.dirname(_csspath_);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    utils.writeFile(_csspath_, cssText,
        {
            encoding: this.options.encoding
        });

  } else {

  }
};


module.exports = StyleResolver;