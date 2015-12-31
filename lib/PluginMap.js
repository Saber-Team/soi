/**
 * @file 插件Map
 * @author AceMood, XCB
 */

var name2plugin = {
  'css' : './plugin/csscompress',
  'less': './plugin/lesscompiler',
  'hash' : './plugin/fingerprint',
  'uglify': './plugin/uglifier',
  'messid': './plugin/idgenerator'
};

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

PluginMap.prototype.getOptions = function (name) {
  return this._map[name];
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
  var that = this;
  this._pluginNameMap.forEach(function (name) {
    var plug = '';
    var Plug = '';
    if (!name2plugin[name]) {
      try {
        Plug = require(name);
        plug = new Plug(that._map[name]);
        plug.init(task);
      }
      catch (e) {
        soi.log.error('require plugin [' + name + '] occur error: [' + e.message + ']');
      }
    }
    else {
      Plug = require(name2plugin[name]);
      plug = new Plug(that._map[name]);
      plug.init(task);
    }
  });
};

module.exports = PluginMap;