/**
 * @fileoverview 单个静态资源基类
 */

'use strict';

var path = require('path');
var fs = require('fs');
var utils = require('../utils');


/**
 * 单个资源基类.
 * @constructor
 */
function ResourceBase(config) {
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
ResourceBase.prototype.toString = function() {
    return 'This Resource instance is a ' + this.type + ' resource.' +
        '\nIts key is ' + this.key + ', to be resolved in encoding ' +
        this.encoding + '.' + '\nAnd its final absolute path is: ' + this.to;
};


/**
 * @abstract
 */
ResourceBase.prototype.createFile = function() {
    throw 'resource.create method must be implemented by subclass.';
};


/**
 * @abstract
 */
ResourceBase.prototype.getHashId = function() {
    throw 'resource.getHashId method must be implemented by subclass.';
};


// export
module.exports = ResourceBase;