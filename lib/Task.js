/**
 * @file Task基类
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');

/**
 * Task
 * @param {String} name
 * @param {?Object} options
 * @constructor
 */
function Task(name, options) {
  this.name = name;
  this.rules = new RuleMap();
  this.plugins = new PluginMap();
  this.options = options;
}
inherits(Task, EventEmitter);

/**
 * 编译处理前触发
 * @param {Function} callback
 */
Task.prototype.beforeCompile = function(callback) {
  this.emit('beforeCompiledStart', this);
  callback.call(this);
};

/**
 * 将js文件中的require相对路径替换成resource ID
 * @param {Function} callback
 */
Task.prototype.resolveRelativeUrl = function(callback) {
  this.emit('resolveRelativeUrlStart', this);
  this.resolveRelativeUrlInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.resolveRelativeUrlInternal = function() {};

/**
 * 本函数做以下事情:
 * 1. 根据匹配规则解析出图像的线上uri
 * 2. 替换样式表中的图像路径
 * 3. 根据匹配规则计算样式表的线上uri
 * 4. 根据匹配规则和依赖树计算js的线上uri
 * @param {Function} callback
 */
Task.prototype.resolveProductUri = function(callback) {
  this.emit('resolveProductUriStart', this);
  this.resolveProductUriInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.resolveProductUriInternal = function() {};

/**
 *
 * @param pattern
 */
Task.prototype.addRules = function(pattern) {

};

/**
 * 应用插件
 */
Task.prototype.apply = function() {
  this.plugins.forEach(function(plug) {
    plug.init(this);
  }, this);
};

/**
 * 记录要使用的服务插件
 * @param {String} service
 * @param {?Object} options
 * @return {Task}
 */
Task.prototype.use = function(service, options) {
  this.plugins.add(service, options);
};

/**
 * 执行
 */
Task.prototype.run = function() {
  this.apply();
  this.beforeCompile(function() {
    this.emit('beforeCompiledDone', this);
    this.resolveRelativeUrl(function() {
      this.emit('resolveRelativeUrlDone', this);
      this.resolveProductUri(function() {

      });
    });
  });
};