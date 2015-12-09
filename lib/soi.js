/**
 * @file s.o.i门面
 * @author XCB
 */

var util = require('util');
var Task = require('./Task');
var RuleMap = require('./RuleMap');

var Neo = require('../../neo/lib/neo');
var Loaders = Neo.Loaders;

var neo = new Neo([
    [
        new Loaders.JSLoader(),
        new Loaders.CSSLoader({
            extractFileContent: true
        }),
        new Loaders.ImageLoader(),
        new Loaders.SWFLoader()
    ],
    [
        /*'core', 'base', 'project'*/ 'test'
    ]
]);

neo.update('.cache', function(map, message) {
    // TODO
    debugger
});


/**
 * soi 名字空间，soi中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace soi
 */
var soi = module.exports = {};

// 注册全局变量
Object.defineProperty(global, 'soi', {
    enumerable: true,
    writable: false,
    value: soi
});

// 注册soi基本服务
soi.log = require('./log');
soi.util = require('./util');

/**
 * 实例化soi基本的两个功能
 * @type {{_tasks: {}, task: exports.release.task}}
 */
soi.deploy = soi.release = {
    _tasks: {},
    task: function (name, options) {
        this._tasks[name] = new Task(name, options);
        return this._tasks[name];
    }
};

/**
 * 添加共用规则
 * @param {String | RegEx } pattern
 * @param {?Object} options
 */
soi.rules = new RuleMap();
soi.addRule = function(pattern, options) {
    soi.rules.add(pattern, options);
};

/**
 * 执行相关的task操作
 * @param {String} type 执行deploy 或者 release 相关task
 * @param {String} task 具体的task名称
 * @param {?Object} argv 其他的命令行参数
 */
soi.run = function (type, task, argv) {
    if (!soi[type][task]) {
        soi.log.error('Error occurred when run task' + task + '. please check your config file \n');
    }
    else {
        soi[type][task].setArgs(argv).run();
    }
};