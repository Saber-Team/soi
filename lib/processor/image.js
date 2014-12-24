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
 * Class deal with image resource
 * @constructor
 * @implements {Processor}
 */
var ImageProcessor = function() {
  this.options = SOI_CONFIG;
  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};


utils.inherits(ImageProcessor, Processor);


/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing image file
 * @param {String} fileName File name of current dealing image file
 */
ImageProcessor.prototype.process = function(base, fileName) {
  // absolute path of original image file
  var _path = utils.normalizeSysPath(
    path.resolve(base, fileName));
  // get the image relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  var resource = Resource.create({
    origin  : origin,
    type    : 'img',
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });
  ResourceTable.register({
    type    : 'img',
    key     : _path,
    value   : resource
  });
};


/**
 * create all image resources
 */
ImageProcessor.prototype.traverse = function() {
  if (!this.options.bundles.img || this.options.bundles.img.length <= 0)
    return;
  // traverse img pkg list
  this.options.bundles.img.forEach(function(pkg) {
    this.currentDistDir = pkg.dist_dir;
    pkg.files.forEach(function(file) {
      // store the list item of img config now
      this.currentFilesItem = file;
      var stat = fs.lstatSync(this.options.base_dir + file);
      if (stat.isFile() && constants.RE_IMG_FILE_EXT.test(file)) {
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


module.exports = ImageProcessor;