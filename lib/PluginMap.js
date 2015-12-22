/**
 * @file 插件Map
 * @author AceMood, XCB
 */

function PluginMap() {
  this._map = {};
  this._pluginNameMap = [];
}
/**
 * 添加插件
 * @param {String} plugin
 * @param {?Object} options
 */
PluginMap.prototype.add = function (plugin, options) {
  this._map[plugin] = options;
  this._pluginNameMap.push(plugin);
};


/**
 * 按照添加顺序遍历插件Map
 * @param {Function} fn
 * @param {?Object} context
 */
PluginMap.prototype.forEach = function(fn, context) {};

/**
 * 应用所有的插件, 每个插件都应该提供一个init方法
 * @param {Task} task
 */
PluginMap.prototype._apply = function (task) {
  this._pluginNameMap.forEach(function (name) {
    require(name).init(task);
  });
};

module.exports = PluginMap;