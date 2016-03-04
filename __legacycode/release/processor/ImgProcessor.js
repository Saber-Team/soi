/**
 * @fileoverview 图片资源处理器
 */

'use strict';

var utils = require('../utils');
var StaticProcessor = require('./StaticProcessor');


/**
 * 图片资源处理器
 * @constructor
 */
var ImageProcessor = function() {
  this.type = 'img';
  StaticProcessor.call(this);
};


utils.inherits(ImageProcessor, StaticProcessor);


// 导出
module.exports = ImageProcessor;