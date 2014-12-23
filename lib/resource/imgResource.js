// Build-In
var path = require('path');
var fs = require('fs');
var util = require('util');

// Custom
var utils = require('../utils');
var Resource = require('./resource');
var constants = require('../constants');


/**
 * Class represents for single Image resource.
 * @constructor
 */
function ImageResource(config) {
  Resource.call(this, config);
  this.type = 'img';
  this.create();
}


util.inherits(ImageResource, Resource);


// According to config file, generate dist file;
ImageResource.prototype.create = function() {
  var ret = utils.getFileHash(this.path, null);
  var dir = path.dirname(this.path);
  var ext = path.extname(this.path);
  var fname = path.basename(this.path, ext);
  var distDir = this.distDir + '/';
  // calculate the relative position of two dirs
  distDir = path.resolve(distDir, path.relative(this.origin, dir));

  if (!fs.existsSync(distDir)) {
    // todo hirachy
    fs.mkdirSync(distDir);
  }

  var p = distDir + '/' + fname + constants.BUILD_FILENAME_CONNECTOR + ret.hex + ext;

  this.distPath = p;
  // fs.writeFileSync(p, ctn, { encoding: this.encoding });
  utils.writeFile(p, ret.content);
};


// export
module.exports = ImageResource;