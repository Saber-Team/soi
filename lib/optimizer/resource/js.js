// Build-In
var path = require('path');
var fs = require('fs');
var util = require('util');

// Custom
var utils = require('../utils');
var Resource = require('./resource');
var constants = require('../constants');


/**
 * Class represents for single javascript resource.
 * @constructor
 */
function JsResource(config) {
  Resource.call(this, config);
  this.type = 'js';
  this.create();
}

util.inherits(JsResource, Resource);

// According to config file, generate dist file;
JsResource.prototype.create = function() {
  /*
   var ret = utils.getFileHash(this.path, this.encoding);
   var dir = path.dirname(this.path);
   var ext = path.extname(this.path);
   var fname = path.basename(this.path, ext);
   var distDir = this.distDir + '/' + this.type + '/';
   // calculate the relative position of two dirs
   distDir = path.resolve(distDir, path.relative(this.origin, dir));

   if (!fs.existsSync(distDir)) {
   fs.mkdirSync(distDir);
   }

   var p = distDir + '/' + fname + '_' + ret.hex + ext;
   // fs.writeFileSync(p, ctn, { encoding: this.encoding });
   fs.writeFileSync(p, ret.content);*/
};

// export
module.exports = JsResource;