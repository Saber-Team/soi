/**
 * @fileoverview 图片资源类
 */


'use strict';


// Build-In
var path = require('path');
var fs = require('fs');
var util = require('util');
var chalk = require('chalk');

// Custom
var utils = require('../utils');
var Resource = require('./resource');
var constants = require('../constants');

/**
 * Class represents for single Image resource.
 * @constructor
 */
function ImageResource(config) {
  this.type = 'img';
  Resource.call(this, config);
  this.create();
}


utils.inherits(ImageResource, Resource);


// According to config file, generate dist file;
StaticResource.prototype.create = function() {
  var ret = utils.getFileHash(this.path, null);
  var dir = path.dirname(this.path);
  var ext = path.extname(this.path);
  var fname = path.basename(this.path, ext);
  var distDir = this.distDir + '/';
  // calculate the relative position of two dirs
  distDir = utils.normalizeSysPath(
      path.resolve(distDir, path.relative(this.origin, dir)));

  // make directory
  utils.mkdir(distDir);

  var p = distDir + '/' + fname +
      constants.FILENAME_CONNECTOR + ret.hex + ext;
  this.distPath = p;

  if (soi().ENV.config.optimizer.debug) {
    console.log(chalk.green(
            'Create static resource file located at:\n  ' + p
    ));
  }
  utils.writeFile(p, ret.content);
  if (soi().ENV.config.optimizer.debug) {
    console.log(chalk.green('Create done.\n'));
  }
};


// 导出
module.exports = ImageResource;
