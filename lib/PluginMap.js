/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file 插件Map
 * @author XCB
 */

var name2plugin = {
  'css' : './plugin/csscompress',
  'less': './plugin/lesscompiler',
  'hash' : './plugin/fingerprint',
  'uglify': './plugin/uglifier',
  'messid': './plugin/idgenerator',
  'wrapper': './plugin/modulewrapper'
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
 * @param {function} fn
 * @param {?object} context
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
      } catch (e) {
        soi.log.error(
          'require plugin [', name, '] occur error: [' + e.message + ']');
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