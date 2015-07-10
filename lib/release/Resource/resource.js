/**
 * @fileoverview 单个静态资源基类
 */

'use strict';

var classMap = {
  css: './css',
  js: './js',
  img: './img',
  tpl: './tpl'
};


var Resource = Object.create(null);


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