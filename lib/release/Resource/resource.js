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
  this.encoding = config.encoding;
  // 针对两个虚拟目录的绝对路径
  this.from = this.key = config.from;
  this.to = config.to;
  // 系统中的真实绝对路径
  this.original = config.original;
  this.dist = config.dist;
}


/**
 * @override
 * @returns {string}
 */
Resource.prototype.toString = function() {
  return 'This Resource instance is a ' + this.type + ' resource.' +
    '\nIts key is ' + this.key + ', to be resolved in encoding ' +
    this.encoding + '.' + '\nAnd its final absolute path is: ' + this.to;
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