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
 * @file Task基类
 * @author AceMood, XCB
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var crypto = require('crypto');

var EventEmitter = require('events').EventEmitter;
var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');

/**
 * 扫描器后的工作流任务
 * @param {string}        name 任务名称
 * @param {?object=}      options 任务配置对象
 * @param {?object=}      soiOptions
 * @param {?object=}      args
 * @param {?ResourceMap=} map
 * @constructor
 */
function Task(name, options, soiOptions, args, map) {
  this.name = name;
  this.rules = new RuleMap();
  this.plugins = new PluginMap();
  this.options = options;
  this.args = args; //包含命令行相关参数
  this.soiOptions = soiOptions;
  this.map = map;

  soi.util.seal(this, [
    'addRule', 'use', 'run', 'setArgs', 'setMap', 'applyPlugin', 'config',
    'mergeRule', 'beforeCompile', 'compile', '_compileImage', '_compileCSS',
    '_compileJS', 'pack', 'postProcess', 'shim', 'flush'
  ]);
}

inherits(Task, EventEmitter);

/** 合并soi共用规则和当前task的规则 */
Task.prototype.mergeRule = function() {
  this.rules.merge(soi.rules);
};

/** 应用插件 */
Task.prototype.applyPlugin = function() {
  this.plugins._apply(this);
  return this;
};


//===============================================
// 以下为公共API, 不可改变
//===============================================
/**
 * 设置命令行相关参数
 * @param {object} params
 * @returns {Task}
 */
Task.prototype.setArgs = function(params) {
  this.args = params;
  return this;
};

/**
 * 设置map资源表相关
 * @param {ResourceMap} map
 * @returns {Task}
 */
Task.prototype.setMap = function(map) {
  this.map = map;
  return this;
};

/**
 * 获取map资源表相关
 * @returns {ResourceMap} map
 */
Task.prototype.getMap = function() {
  return this.map;
};

/**
 * 添加规则
 * @param {string|RegExp} pattern
 * @param {?object} options
 */
Task.prototype.addRule = function(pattern, options) {
  this.rules.add(pattern, options);
  return this;
};

/**
 * 记录要使用的服务插件
 * @param {string} plug
 * @param {?object} options
 * @return {Task}
 */
Task.prototype.use = function(plug, options) {
  this.plugins.add(plug, options);
  return this;
};

/** 执行 */
Task.prototype.run = function() {
  // 合并soi级别规则和当前task规则
  this.mergeRule();
  // 应用插件
  this.applyPlugin();

  this.emit('beforeCompile', this);
  this.beforeCompile(function() {
    this.emit('compile', this);
    // 编译
    this.compile(function() {
      this.emit('compiled', this);
      this.emit('pack', this);
      // 合并打包
      this.pack(function() {
        this.emit('packed', this);
        // 后处理
        this.postProcess(function() {
          this.emit('postProcessed', this);
          // 简化资源表
          this.shim(function() {
            this.emit('shim', this);
            // 写文件
            this.flush(function() {
              this.emit('flushed', this);
              this.emit('complete', this);
            });
          });
        });
      });
    });
  });
};

/**
 * 编译处理前触发
 * @param {function} callback
 */
Task.prototype.beforeCompile = function(callback) {
  var task = this;
  task.beforeCompileInternal(callback);
};

/**
 * 资源维度递归编译
 * @param {function} callback
 */
Task.prototype.compile = function(callback) {
  var task = this;
  var map = this.getMap();

  // 遍历资源表进行编译
  map.getAllResources().forEach(resource => {
    var events = [
      'pre-compile-resource',
      'compiled-resource',
      'pre-resolve-resource',
      'resolved-resource'
    ];

    events.forEach(name => {
      resource.on(name, value => {
        task.emit(name, value);
      });
    });
  });

  map.getAllResources().forEach(resource => {
    if (resource.getContent()) {
      soi.log.info('Compile file [' + resource.path +']');
      resource.compile(task.map, task.rules);
    }
  });

  process.nextTick(callback.bind(task));
};

/**
 * 合并文件
 * @param {function} callback
 */
Task.prototype.pack = function(callback) {
  var task = this;
  var map = task.map;
  map.pkgs = {};
  var resources = map.getAllResources();

  function pkgIdCounter() {
    let counter = 0;
    return function() {
      return counter++;
    };
  }

  var packOptions = task.options.pack;
  var counter = pkgIdCounter();

  if (packOptions) {
    Object.keys(packOptions).forEach(pkgPath => {
      let pool = [];
      let pkgId = 'p' + counter();

      packOptions[pkgPath].forEach(pattern => {
        resources.forEach(resource => {
          let _ = soi.util.normalize(pattern);
          if (_.test(resource.path)) {
            pool.push(resource);
            resource.included = resource.included ? resource.included.push(pkgId) : [pkgId];
          }
        });
      });

      if (pool.length) {
        let contentAll = '';
        pool.forEach(resource => {
          contentAll += resource.getContent();
        });

        let sum = crypto.createHash('sha1');
        sum.update(contentAll);

        let pkgPathObj = node_path.parse(pkgPath);
        pkgPathObj.base = sum.digest('hex').substr(0, 7) + '.pkg.' + pkgPathObj.base;
        map.pkgs[pkgId] = {
          uri: node_path.format(pkgPathObj),
          has: pool.map(resource => resource.id),
          _fileContent: contentAll
        }
      }
    });
  }

  process.nextTick(callback.bind(task));
};

/**
 * 编译后处理
 * @param {function} callback
 */
Task.prototype.postProcess = function(callback) {
  var task = this;
  task.postProcessInternal(callback);
};

/**
 * 为资源表瘦身
 * @param {function} callback
 */
Task.prototype.shim = function(callback) {
  var task = this;
  task.shimInternal(callback);
};

/**
 * 将文件写入
 * @param {function} callback
 */
Task.prototype.flush = function(callback) {
  var task = this;
  task.flushInternal(callback);
};


//===============================================
// 以下为插件扩展点API, 插件可选择覆盖的方法
//===============================================
Task.prototype.beforeCompileInternal = function(callback) {
  process.nextTick(callback.bind(this));
};
Task.prototype.postProcessInternal = function(callback) {
  process.nextTick(callback.bind(this));
};
Task.prototype.shimInternal = function(callback) {
  process.nextTick(callback.bind(this));
};
Task.prototype.flushInternal = function(callback) {
  process.nextTick(callback.bind(this));
};


module.exports = Task;