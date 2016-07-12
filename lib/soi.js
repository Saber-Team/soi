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
 * @file soi门面
 * @author XCB, AceMood
 */

'use strict';

const fs          = require('fs');
const util        = require('util');
const RuleMap     = require('./RuleMap');
const Neo         = require('neo-core');
const profiler    = require('./profiler');
const log         = require("et-util-logger");
const jscompiler  = require('./compiler/js');
const csscompiler = require('./compiler/css');
const imgcompiler = require('./compiler/img');
const release     = require('./command/release');
const deploy      = require('./command/deploy');

// 资源编译器相关
var __compilerContainer = Object.create(null);

const addCompiler = function(resourceType, compiler) {
  if (!compiler || (typeof compiler.exec !== 'function')) {
    soi.log.error('soi.addCompiler with wrong parameters');
  }
  __compilerContainer[resourceType] = compiler;
};

const getCompiler = function(resourceType) {
  return __compilerContainer[resourceType];
};

// 命令函数相关
var __commandCache = Object.create(null);

/**
 * 向soi注册要响应的命令行命令
 * @param {string} command 命令
 * @param {object} executor 包含exec执行函数的命令对象
 */
const registerCommand = function(command, executor) {
  __commandCache[command] = executor;
};

const queryCommand = function(command) {
  return __commandCache[command];
};

// 配置相关, 默认配置如下
var __CONFIG = {
  types: ['JS', 'CSS'],
  forceRescan: false,
  logLevel: log.Level.INFO
};

/**
 * 添加多任务间的共享规则
 * @param {string|RegExp} pattern
 * @param {?object} options
 * @return {!object} soi
 */
const addRule = function(pattern, options) {
  soi.rules.add(pattern, options);
  return soi;
};

/**
 * 执行相关的task操作
 * @param {string} taskType 执行方法, deploy 或者 release
 * @param {string} taskName 具体的task名称
 * @param {?object} argv 其他的命令行参数
 */
const run = function(taskType, taskName, argv) {
  soi.log = new log.Logger(soi.config.get('logLevel'));
  profiler.record('run:start');

  taskName = taskName || 'default';
  let task = soi[taskType].getTask(taskName);
  if (!task) {
    soi.log.error(`Can't run ${taskType} ${taskName}.`);
    process.exit(0);
  }

  let loaders = (task.options.loaders || []);
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
      .setArgs({taskName: taskName, argv: argv})
      .run();

    profiler.record('compile:end');

    profiler.log('scan:start', 'scan:end');
    profiler.log('compile:start', 'compile:end');
  }, {
    forceRescan: soi.config.get('forceRescan')
  });
};

/**
 * soi中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace soi
 */
var soi = module.exports = Object.create(null);

/** 注册全局soi */
Object.defineProperty(global, 'soi', {
  enumerable: true,
  value: soi
});

/** 为全局soi注册方法 */
Object.defineProperties(soi, {
  util: {
    enumerable: true,
    value: require('./util')
  },
  fn: {
    enumerable: true,
    value: require('./util/func')
  },
  Loaders: {
    enumerable: true,
    value: Neo.Loaders
  },
  config: {
    enumerable: true,
    value: {
      /**
       * 对打包流程进行配置，可多次配置
       * @param {!string} name `.`分割的属性名
       * @param {!object} property 可如下配置项
       *                  --types       打印资源表的时候需要打印的资源类型, 有插件可能会添加新的资源类型
       *                  --forceRescan 是否忽略资源表之前的缓存结果而重新扫描，默认是false
       *                  --logLevel    日志记录的打印等级，见et-util-logger模块，默认是WARNING
       */
      set: function(name, property) {
        let props = name.split('.');
        let lastProp = props.pop();
        let ops = __CONFIG;
        props.forEach(prop => {
          if (!ops[prop]) {
            ops[prop] = {};
          }
          ops = ops[prop];
        });
        ops[lastProp] = property;
      },
      get: function(name) {
        let ret = __CONFIG;
        let props = name.split('.');
        let prop;
        while (prop = props.shift()) {
          ret = ret[prop];
          if (!ret && props.length)  {
            throw `Can't get config property ${name}`;
          }
        }
        return ret;
      }
    }
  },
  addCompiler: {
    enumerable: true,
    value: addCompiler
  },
  getCompiler: {
    enumerable: true,
    value: getCompiler
  },
  registerCommand: {
    enumerable: true,
    value: registerCommand
  },
  queryCommand: {
    enumerable: true,
    value: queryCommand
  },
  rules: {
    enumerable: true,
    writable: true,
    value: new RuleMap()
  },
  addRule: {
    enumerable: true,
    value: addRule
  },
  log: {
    enumerable: true,
    writable: true,
    value: new log.Logger(log.Level.ALL)
  }
});

// 添加默认编译函数
soi.addCompiler('JS', jscompiler);
soi.addCompiler('CSS', csscompiler);
soi.addCompiler('Image', imgcompiler);

// 注册默认命令
soi.registerCommand('release', release);
soi.registerCommand('deploy', deploy);