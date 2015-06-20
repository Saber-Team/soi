// Build-In
var path = require('path');
var fs = require('fs');

// Custom
var utils = require('../utils');
var constants = require('../constants');
var classMap = {
  css: './css',
  js: './js',
  img: './img',
  htc: './htc',
  font: './font',
  swf: './swf'
};

/**
 * Base Class represents for single resource.
 * @constructor
 */
function Resource(config) {
  this.origin = config.origin;
  this.path = config.path;
  this.encoding = config.encoding;
  this.distDir = config.dist;
}

// override default toString method
Resource.prototype.toString = function() {
  return 'This Resource instance is a ' + this.type + ' resource.' +
    '\nIts real path is ' + this.path + ', to be resolved in encoding ' +
    this.encoding + '.' + '\n';
};

// According to config file, generate dist file;
Resource.prototype.create = function() {};

// static method to create resource instance
Resource.create = function(config) {
  var klass = require(classMap[config.type]);
  return new klass(config);
};

// export
module.exports = Resource;