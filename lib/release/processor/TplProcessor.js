/**
 * @fileoverview tpl资源处理器
 * @email zmike86@gmail.com
 * @author AceMood
 */

'use strict';

var utils = require('../utils');
var StaticProcessor = require('./StaticProcessor');


/**
 * tpl处理器
 * @constructor
 */
var TplProcessor = function () {
    this.type = 'tpl';
    StaticProcessor.call(this);
};

utils.inherits(TplProcessor, StaticProcessor);


// 导出
module.exports = TplProcessor;