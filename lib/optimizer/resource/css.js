// Build-In
var path = require('path');
var fs = require('fs');
var util = require('util');

// Custom
var utils = require('../utils');
var Resource = require('./resource');
var constants = require('../constants');


/**
 * Class represents for single style sheet resource.
 * @constructor
 */
function CssResource(config) {
  Resource.call(this, config);
  this.type = 'css';
  this.create();
}

util.inherits(CssResource, Resource);

// According to config file, generate dist file;
CssResource.prototype.create = function() {
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
module.exports = CssResource;