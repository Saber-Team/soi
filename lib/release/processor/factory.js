/**
 * @fileoverview 一个处理器的工厂代理.
 */

'use strict';

var ImageProcessor = require('./img');
var ScriptProcessor = require('./js');
var StyleProcessor = require('./css');

function ProcesssorFactory() {}

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
    default :
      throw 'Processor type: ' + type + ' is not supported.';
      break;
  }
};

module.exports = ProcesssorFactory;