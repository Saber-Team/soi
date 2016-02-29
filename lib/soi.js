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
 * @file s.o.i门面
 * @author XCB, AceMood
 */

'use strict';

var fs = require('fs');
var util = require('util');

var DeployTask = require('./DeployTask');
var ReleaseTask = require('./ReleaseTask');
var RuleMap = require('./RuleMap');
var Neo = require('neo-core');
var profiler = require('./profiler');
var log = require("et-util-logger");

/**
 * soi中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace soi
 */
var soi = module.exports = Object.create(null);

// 注册全局soi
Object.defineProperty(global, 'soi', {
  enumerable: true,
  writable: false,
  value: soi
});

soi.util = require('./util');
soi.fn = require('./util/func');
soi.Loaders = Neo.Loaders;
soi.config = Object.create(null);

/**
 * 实例化soi基本的两个功能
 * @type {{_tasks: {}, task: exports.release.task}}
 */
soi.deploy = {
  _tasks: {},
  task: function(name, options) {
    this._tasks[name] = new DeployTask(name, options);
    return this._tasks[name];
  }
};

/**
 * 实例化soi基本的两个功能
 * @type {{_tasks: {}, task: exports.release.task}}
 */
soi.release = {
  _tasks: {},
  task: function(name, options) {
    this._tasks[name] = new ReleaseTask(name, options);
    return this._tasks[name];
  }
};

/**
 * 对打包流程进行配置，可多次配置
 * @param {!object} config 可含有如下配置项
 *                  --forceRescan 是否忽略资源表之前的缓存结果而重新扫描，默认是false
 *                  --logLevel    日志记录的打印等级，见et-util-logger模块，默认是WARNING
 */
soi.config.set = function(config) {
  if (!soi.config._cache) {
    soi.config._cache = {};
  }

  Object.keys(config).forEach(key => {
    soi.config._cache[key] = config[key];
  });
};

soi.config.get = function(name) {
  if (!soi.config._cache) {
    soi.config._cache = {};
  }

  return soi.config._cache[name];
};

/**
 * 添加多任务间的共享规则
 * @param {string|RegExp} pattern
 * @param {?object} options
 */
soi.rules = new RuleMap();
soi.addRule = function(pattern, options) {
  soi.rules.add(pattern, options);
  return soi;
};

/**
 * 执行相关的task操作
 * @param {string} taskType 执行deploy 或者 release 相关task
 * @param {string} taskName 具体的task名称
 * @param {?object} argv 其他的命令行参数
 */
soi.run = function(taskType, taskName, argv) {
  soi.log = new log.Logger(soi.config.get('logLevel') || log.Level.WARNING);
  profiler.record('run:start');

  taskName = taskName || 'default';
  if (!soi[taskType]._tasks[taskName]) {
    soi.log.error(`Can't run task ${taskName}.`);
    process.exit(0);
  } else {
    let task = soi[taskType]._tasks[taskName];
    let loaders = (task.options.loaders || [
      new Loaders.JSLoader(),
      new Loaders.CSSLoader(),
      new Loaders.ImageLoader()
    ]);

    task.options.logger = soi.log;
    let neo = new Neo(
      loaders,
      task.options.scandirs,
      task.options
    );

    profiler.record('scan:start');
    neo.update('.cache', function(map) {
      profiler.record('scan:end');
      profiler.record('compile:start');

      task
        .setMap(map)
        .setArgs({taskType: taskType, taskName: taskName, argv: argv})
        .run();

      profiler.record('compile:end');

      profiler.log('scan:start', 'scan:end');
      profiler.log('compile:start', 'compile:end');
    }, {
      forceRescan: !!soi.config.get('forceRescan')
    });
  }
};