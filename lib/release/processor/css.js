// Built-in
var path = require('path');
var fs = require('fs');

// Custom
var utils = require('../utils');
var constants = require('../constants');
var Processor = require('./processor');
var Walker = require('../dirwalker/walker');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');


/**
 * Class deal with css resource
 * @constructor
 * @implements {Processor}
 */
var StyleProcessor = function() {
  this.options = soi().ENV.config.optimizer;
  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};

utils.inherits(StyleProcessor, Processor);

/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing css file
 * @param {String} fileName File name of current dealing css file
 */
StyleProcessor.prototype.process = function(base, fileName) {
  // absolute path of original css file
  var _path = utils.normalizeSysPath(path.resolve(base, fileName));

  // get the css relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  // Create resource instance but without generating any style sheets,
  // because all style files are high recommended to be bundled into one.
  var resource = Resource.create({
    origin  : origin,
    type    : 'css',
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });

  // register resource table
  ResourceTable.register({
    type    : 'css',
    key     : _path,
    value   : resource
  });
};


/**
 * create all css resources
 */
StyleProcessor.prototype.traverse = function() {
  if (!this.options.bundles.css || this.options.bundles.css.length <= 0)
    return;

  // traverse css directory list
  this.options.bundles.css.forEach(function(pkg) {
    var input = pkg.input; //abs path
    this.currentDistDir = pkg.dist_dir;
    // no files field
    // TODO(zmike86): Shall we parse import statments to register modules here?
    // update: We have moved the code to css resolver --> css parser
    if (input) {
      return;
    }
    // directly register module
    pkg.files.forEach(function(file) {
      // store the list item of js config now
      this.currentFilesItem = file;
      var stat = fs.lstatSync(this.options.base_dir + file);
      if (stat.isFile() && file.indexOf(constants.CSS_FILE_EXT) === file.length - 4) {
        this.process(this.options.base_dir, file);
      } else if (stat.isDirectory()) {
        var dir = path.resolve(this.options.base_dir, file);
        var walker = new Walker({
          dirname: dir
        });
        walker.walk(this.process.bind(this));
      }
    }, this);
  }, this);
};


module.exports = StyleProcessor;