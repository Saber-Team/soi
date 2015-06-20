/**
 * @fileoverview 单个静态资源基类
 */

'use strict';

// Build-In
var path = require('path');
var fs = require('fs');

// Custom
var utils = require('../utils');
var classMap = {
  css: './css',
  js: './js',
  img: './img'
};


/**
 * 单个资源基类.
 * @constructor
 */
function Resource(config) {
  this.type = config.type;
  this.path = config.path;
  this.encoding = config.encoding;
  this.dist = config.dist;
}


/**
 * @override
 * @returns {string}
 */
Resource.prototype.toString = function() {
  return 'This Resource instance is a ' + this.type + ' resource.' +
    '\nIts key is ' + this.path + ', to be resolved in encoding ' +
    this.encoding + '.' + '\nAnd its final absolute path is: ' + this.dist;
};


/**
 * @abstract
 */
Resource.prototype.create = function() {
  throw 'resource.create method must be implemented by subclass.';
};


// static method to create resource instance
Resource.create = function(config) {
  var klass = require(classMap[config.type]);
  return new klass(config);
};


// export
module.exports = Resource;