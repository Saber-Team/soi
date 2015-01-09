// Build-In
var path = require('path');
var fs = require('fs');
var util = require('util');

// Custom
var utils = require('../utils');
var Resource = require('./resource');
var constants = require('../constants');

/**
 * Class represents for web-font resource.
 * @constructor
 */
function FontResource(config) {
  Resource.call(this, config);
  this.type = 'font';
  this.create();
}

util.inherits(FontResource, Resource);

// According to config file, generate dist file;
FontResource.prototype.create = function() {
  var ret = utils.getFileHash(this.path, this.encoding);
  var dir = path.dirname(this.path);
  var ext = path.extname(this.path);
  var fname = path.basename(this.path, ext);
  var distDir = this.distDir + '/' + this.type + '/';
  // calculate the relative position of two dirs
  distDir = path.resolve(distDir, path.relative(this.origin, dir));

  if (!fs.existsSync(distDir)) {
    // todo hirachy
    fs.mkdirSync(distDir);
  }

  var p = distDir + '/' + fname + constants.BUILD_FILENAME_CONNECTOR + ret.hex + ext;

  this.distPath = p;
  utils.writeFile(p, ret.content, { encoding: this.encoding });
};

// export
module.exports = FontResource;