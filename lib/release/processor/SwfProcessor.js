/**
 * @fileoverview Swf资源处理器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var utils = require('../utils');
var StaticProcessor = require('./StaticProcessor');


/** @constructor */
var SwfProcessor = function() {
  this.type = 'swf';
  StaticProcessor.call(this);
};


utils.inherits(SwfProcessor, StaticProcessor);


// 导出
module.exports = SwfProcessor;