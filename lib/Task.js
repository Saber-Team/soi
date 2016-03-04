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

var os = require('os');
var node_url = require('url');
var node_path = require('path');
var EventEmitter = require('events').EventEmitter;
var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');
var name2plugin = require('./name2plugin');

class Task extends EventEmitter {
  /**
   * 扫描器后的工作流任务
   * @param {string}    name 任务名称
   * @param {?object=}  options 任务配置对象
   */
  constructor(name, options) {
    super();

    this.name = name;
    this.rules = new RuleMap();
    this.plugins = new PluginMap();
    this.options = options;

    soi.util.seal(this, [
      'addRule', 'use', 'run', 'setArgs', 'setMap', 'applyPlugin', 'config',
      'mergeRule', 'beforeCompile', 'compile', 'pack', 'postProcess', 'flush'
    ]);
  }

  /** 合并soi共用规则和当前task的规则 */
  mergeRule() {
    this.rules.merge(soi.rules);
  }

  /** 应用插件 */
  applyPlugin() {
    this.plugins.forEach(function(pluginName) {
      var plug = '';
      var Plug = '';
      if (!name2plugin[pluginName]) {
        try {
          Plug = require(pluginName);
          plug = new Plug(this.plugins._map[pluginName]);
          plug.init(this);
        } catch (err) {
          soi.log.error(
            `require plugin [${pluginName}] Exception: [${err.message}]`);
        }
      } else {
        Plug = require(name2plugin[pluginName]);
        plug = new Plug(this.plugins._map[pluginName]);
        plug.init(this);
      }
    }, this);
    return this;
  }

//===============================================
// 以下为公共API, 不可改变
//===============================================
  /**
   * 设置命令行相关参数
   * @param {object} params
   * @returns {Task}
   */
  setArgs(params) {
    this.args = params;
    return this;
  }

  /**
   * 设置map资源表相关
   * @param {ResourceMap} map
   * @returns {Task}
   */
  setMap(map) {
    this.map = map;
    return this;
  }

  /**
   * 获取map资源表相关
   * @returns {ResourceMap} map
   */
  getMap() {
    return this.map;
  }

  /**
   * 添加规则
   * @param {string|RegExp} pattern
   * @param {?object} options
   */
  addRule(pattern, options) {
    // 配置了全局域名
    if (this.options.domain) {
      options.to = node_url.resolve(this.options.domain, options.to);
    }
    this.rules.add(pattern, options);
    return this;
  }

  /**
   * 记录要使用的服务插件
   * @param {string} plug
   * @param {?object} options
   * @return {Task}
   */
  use(plug, options) {
    this.plugins.add(plug, options);
    return this;
  }

  /** 执行 */
  run() {
    var task = this;

    // 合并soi全局规则和当前task规则
    task.mergeRule();
    // 应用插件
    task.applyPlugin();

    // 预处理
    task.emit('beforeCompile', task);
    task.beforeCompile(() => {
      task.emit('beforeCompiled', task);
      // 编译资源
      task.compile(() => {
        task.emit('compiled', task);
        // 合并打包
        task.pack(() => {
          task.emit('packed', task);
          // 后处理
          task.postProcess(() => {
            task.emit('postProcessed', task);
            // 写文件
            task.flush(() => {
              task.emit('flushed', task);
              task.emit('complete', task);
            });
          });
        });
      });
    });
  }

  /**
   * 编译处理前触发
   * @param {function} callback
   */
  beforeCompile(callback) {
    var task = this;
    task.beforeCompileInternal(callback);
  }

  /**
   * 资源维度递归编译
   * @param {function} callback
   */
  compile(callback) {
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
        soi.log.info(`Compile file [${resource.path}]`);

        let to = '';
        let hitOptions = task.rules.match(resource.path);
        if (hitOptions) {
          to = hitOptions.to;
          if (typeof to !== 'string') {
            soi.log.error('rule\'s to property must be string.');
            throw new Error('the path ' + to +' must be string');
          }
        }

        resource.compile(task.map, to);
      }
    });

    process.nextTick(callback.bind(task));
  }

  /**
   * 合并文件
   * @param {function} callback
   */
  pack(callback) {
    var task = this;
    var map = task.map;
    var resources = map.getAllResources();

    function pkgIdCounter() {
      let counter = 0;
      return function() {
        return counter++;
      };
    }

    var packOptions = task.options.pack;
    var counter = pkgIdCounter();

    map.pkgs = {};
    if (packOptions) {
      Object.keys(packOptions).forEach(pkgPath => {
        let pool = [];
        let pkgId = 'p' + counter();

        packOptions[pkgPath].forEach(pattern => {
          resources.forEach(resource => {
            let _ = soi.util.normalize(pattern);
            if (_.test(resource.path)) {
              pool.push(resource);
              resource.within = resource.within ? resource.within.push(pkgId) : [pkgId];
            }
          });
        });

        if (pool.length) {
          let contentAll = '';
          pool.forEach(resource => {
            contentAll += resource.getContent() + os.EOL;
          });

          let uri;
          if (task.options.domain) {
            uri = node_url.resolve(task.options.domain, pkgPath);
          } else {
            uri = pkgPath;
          }
          map.pkgs[pkgId] = {
            uri: uri,
            has: pool.map(resource => resource.id),
            _fileContent: contentAll
          }
        }
      });
    }

    process.nextTick(callback.bind(task));
  }

  /**
   * 编译后处理
   * @param {function} callback
   */
  postProcess(callback) {
    var task = this;
    task.postProcessInternal(callback);
  }

  /**
   * 将文件写入
   * @param {function} callback
   */
  flush(callback) {
    var task = this;
    task.flushInternal(callback);
  }

//===============================================
// 以下为插件扩展点API, 插件可选择覆盖的方法
//===============================================
  beforeCompileInternal(callback) {
    process.nextTick(callback.bind(this));
  }

  postProcessInternal(callback) {
    process.nextTick(callback.bind(this));
  }

  flushInternal(callback) {
    process.nextTick(callback.bind(this));
  }
}

module.exports = Task;