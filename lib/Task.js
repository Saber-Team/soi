/**
 * @file Task基类
 *  todo 看是否需要优化删减
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');

/**
 * Task
 * @param {String}      name
 * @param {?Object}     options
 * @param {?Object}     soiOptions
 * @param {?Object}     args
 * @param {ResourceMap} map
 * @constructor
 */
function Task(name, options, soiOptions, args, map) {
  this.name = name;
  this.rules = new RuleMap();
  this.plugins = new PluginMap();
  this.options = options;
  this.args = args; //命令行相关参数
  this.soiOptions = soiOptions;
  this.map = map;
}
inherits(Task, EventEmitter);

/**
 * 设置命令行相关参数
 * @param params
 * @returns {Task}
 */
Task.prototype.setArgs = function (params) {
  this.args = params;
  return this;
};

/**
 * 设置map 资源表相关
 * @param params
 * @returns {Task}
 */
Task.prototype.setMap = function (map) {
  this.map = map;
  return this;
};

/**
 * 合并soi共用规则和当前task的规则
 */
Task.prototype.mergeRule = function() {
  this.rules.merge(soi.rules);
};

/**
 * 编译处理前触发
 * @param {Function} callback
 */
Task.prototype.beforeCompile = function(callback) {
  this.beforeCompileInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.beforeCompileInternal = function() {};

/**
 * I. 将js文件中的require相对路径替换成resource ID
 * II.函数做以下事情:
 *   1. 根据匹配规则解析出图像的线上uri
 *   2. 替换样式表中的图像路径
 *   3. 根据匹配规则计算样式表的线上uri
 *   4. 根据匹配规则和依赖树计算js的线上uri
 * @param {Function} callback
 */
Task.prototype.compile = function(callback) {
  this.resolveRelativeUrlInternal();
  this.resolveProductUriInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.resolveRelativeUrlInternal = function() {};

/**
 * @override
 */
Task.prototype.resolveProductUriInternal = function() {};

/**
 * @param {Function} callback
 */
Task.prototype.postProcess = function(callback) {
  this.postProcessInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.postProcessInternal = function() {};

/**
 * 为资源表瘦身
 * @param {Function} callback
 */
Task.prototype.shim = function(callback) {
  this.shimInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.shimInternal = function() {};

/**
 * 将文件写入
 * @param {Function} callback
 */
Task.prototype.flush = function(callback) {
  this.flushInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.flushInternal = function() {};

/**
 * 应用插件
 */
Task.prototype.apply = function() {
  this.plugins.apply(this);
  return this;
};

//===============================================
// 以下为公共API
//===============================================

/**
 * 添加规则
 * @param {String|RegExp} pattern
 * @param {?Object} options
 */
Task.prototype.addRule = function(pattern, options) {
  this.rules.add(pattern, options);
  return this;
};

/**
 * 记录要使用的服务插件
 * @param {String} plug
 * @param {?Object} options
 * @return {Task}
 */
Task.prototype.use = function(plug, options) {
  this.plugins.add(plug, options);
  return this;
};

/**
 * 执行
 */
Task.prototype.run = function() {
  this.mergeRule();
  this.apply();
  this.emit('beforeStart', this);
  this.beforeCompile(function() {
    this.emit('compile', this);
    this.compile(function() {
      this.emit('compiled', this);
      this.postProcess(function() {
        this.emit('postProcessed', this);
        this.shim(function() {
          this.emit('shim', this);
          this.flush(function() {
            this.emit('flushed', this);
            this.emit('complete', this);
          });
        });
      });
    });
  });
};