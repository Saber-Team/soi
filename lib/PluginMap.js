/**
 * @file 插件Map
 * @author AceMood, XCB
 */

function PluginMap() {
  this._map = {};
}

/**
 * 添加插件
 * @param {String} plug
 * @param {?Object} option
 */
PluginMap.prototype.add = function(plug, option) {

};

/**
 * 按照添加顺序遍历插件Map
 * @param {Function} fn
 * @param {?Object} context
 */
PluginMap.prototype.forEach = function(fn, context) {

};

module.exports = PluginMap;