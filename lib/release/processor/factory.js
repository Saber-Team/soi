/**
 * @fileoverview 一个处理器的工厂代理.
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var TplProcessor = require('./TplProcessor');
var ImageProcessor = require('./ImgProcessor');
var SwfProcessor = require('./SwfProcessor');
var ScriptProcessor = require('./JsProcessor');
var StyleProcessor = require('./CssProcessor');


/**
 * @constructor 处理器工厂对象
 */
function ProcesssorFactory () {}


/**
 * 根据资源类型返回该种资源的处理器
 * @param {String} type
 * @returns {*}
 */
ProcesssorFactory.getInstance = function (type) {
  switch (type) {
    case 'swf':
      return new SwfProcessor();
      break;
    case 'img':
      return new ImageProcessor();
      break;
    case 'js':
      return new ScriptProcessor();
      break;
    case 'css':
      return new StyleProcessor();
      break;
    case 'tpl':
      return new TplProcessor();
      break;
    default :
      throw 'Processor type: ' + type + ' is not supported.';
      break
  }
};


// 导出
module.exports = ProcesssorFactory;