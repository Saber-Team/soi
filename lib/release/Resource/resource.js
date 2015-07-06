/**
 * @fileoverview 单个静态资源基类
 */

'use strict';

var path = require('path');
var fs = require('fs');

var utils = require('../utils');
var classMap = {
  css: './css',
  js: './js',
  img: './img',
  tpl: './tpl'
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
  // 唯一名
  this.hashId = '';
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
Resource.prototype.createFile = function() {
  throw 'resource.create method must be implemented by subclass.';
};


/**
 * @abstract
 */
Resource.prototype.getHashId = function() {
  throw 'resource.getHashId method must be implemented by subclass.';
};


/**
 * 根据processor的配置对象创建相应类型的资源
 * @param {Object} config 处理器计算出的配置对象
 * @returns {Object}
 */
Resource.create = function(config) {
  var Klass = require(classMap[config.type]);
  return new Klass(config);
};


// export
module.exports = Resource;