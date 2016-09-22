/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file 插件Map
 * @author XCB
 */

function PluginMap() {
    this._map = {};
    this._pluginNameMap = [];
}
/**
 * 添加插件
 * @param {string} plugin
 * @param {?object} options
 */
PluginMap.prototype.add = function (plugin, options) {
    this._map[plugin] = options;
    this._pluginNameMap.push(plugin);
};

PluginMap.prototype.getOptions = function (name) {
    return this._map[name];
};

/**
 * 按照添加顺序遍历插件Map, 每个插件都应该提供一个init方法
 * @param {function} fn
 * @param {?object} context
 */
PluginMap.prototype.forEach = function(fn, context) {
    this._pluginNameMap.forEach(fn, context);
};

module.exports = PluginMap;