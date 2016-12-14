/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file soi facade
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
const fontcompiler= require('./compiler/font');
const release     = require('./command/release');
const deploy      = require('./command/deploy');

// resource compiler
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

// command functions
var __commandCache = Object.create(null);

/**
 * 向soi注册要响应的命令行命令
 * @param {string} command 命令
 * @param {object} executor 包含exec执行函数的命令对象
 */
const registerCommand = function(command, executor) {
    soi[command] = __commandCache[command] = executor;
};

const queryCommand = function(command) {
    return __commandCache[command];
};

// Default configuration
var __CONFIG = {
    types: ['js', 'css'],
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
 * soi中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace soi
 */
var soi = module.exports = Object.create(null);

/**
 * Global soi variable
 */
Object.defineProperty(global, 'soi', {
    enumerable: true,
    value: soi
});

/**
 * 为全局soi注册方法
 */
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
    processor: {
        enumerable: true,
        value: Object.create(null)
    },
    config: {
        enumerable: true,
        value: {
            /**
             * 对打包流程进行配置，可多次配置
             * @param {!string} name `.`分割的属性名
             * @param {!object} property 可如下配置项
             *                  --types       打印资源表的时候需要打印的资源类型, 插件可能会添加新的资源类型
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

// register compilers
soi.addCompiler('js', jscompiler);
soi.addCompiler('css', csscompiler);
soi.addCompiler('image', imgcompiler);
soi.addCompiler('font', fontcompiler);

// register commands
soi.registerCommand('release', release);
soi.registerCommand('deploy', deploy);

// register processors
soi.processor.less = require('./processor/less');
soi.processor['babel-es2015'] = require('./processor/babel-es2015');
soi.processor['babel-jsx'] = require('./processor/babel-jsx');