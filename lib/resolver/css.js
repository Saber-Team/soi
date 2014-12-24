// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var ResourceTable = require('../resource/table');
var Package = require('../resource/package');
var parser = require('./cssParser');


var codeTree;


/**
 * Class deal with css resource
 * @constructor
 * @implements {Resolver}
 */
var StyleResolver = function() {
  this.options = SOI_CONFIG;
  // current resolving pkg in bundles.css's items.
  this.currentPkg = null;
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
    cssFilesArray.forEach(function(path, i) {
        content += (i !== 0 ? '\n' : '') + codeTree[path];
    }, this);
    return content;
};


/**
 * According code tree write the file in array to a dist file.
 * @param {Array.<String>} cssFilesArray
 */
StyleResolver.prototype.write2compress = function(cssFilesArray) {
  var cssText = this.combo(cssFilesArray);
  var hex = utils.getStringHash(cssText).hex;
  var _csspath_ = this.currentPkg.dist_dir + '/' +
    path.basename(this.currentPkg.dist_file, constants.CSS_FILE_EXT) +
    constants.BUILD_FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

  var dir = path.dirname(_csspath_);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  utils.writeFile(_csspath_, cssText,
    { encoding: this.options.encoding });

  // register package
  var pkg = new Package({
    type    : 'css',
    input   : cssFilesArray[cssFilesArray.length - 1],
    files   : cssFilesArray,
    dist_file: _csspath_
  });
  ResourceTable.registerPackage({
    type    : 'css',
    key     : pkg.input,
    value   : pkg
  });

};


/**
 * calculate module dependency, combo and compress css files
 */
StyleResolver.prototype.resolve = function() {
  if (!this.options.bundles.css)
    return;

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
    } else {
      /*
      codeTree = {};
      var files = [];
      // generate code tree.
      pkg.files.forEach(function(file) {
        var p = path.resolve(this.options.base_dir, file);
        files.push(p);
        var content = utils.readFile(p, { encoding: this.options.encoding });
        var ast = css.parse(content);
        codeTree[p] = css.stringify(ast, { compress: true });
      }, this);
      this.write2compress(files);*/
    }
  }, this);
};


module.exports = StyleResolver;