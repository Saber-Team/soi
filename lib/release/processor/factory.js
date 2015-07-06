/**
 * @fileoverview 一个处理器的工厂代理.
 */


'use strict';


var TplProcessor = require('./tpl');
var ImageProcessor = require('./img');
var ScriptProcessor = require('./js');
var StyleProcessor = require('./css');


/**
 * @constructor
 */
function ProcesssorFactory() {}


/**
 * 根据资源类型返回该种资源的处理器
 * @param {String} type
 * @returns {*}
 */
ProcesssorFactory.getInstance = function(type) {
  switch (type) {
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
      break;
  }
};


// 导出
module.exports = ProcesssorFactory;