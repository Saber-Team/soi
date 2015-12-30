/**
 * @file s.o.i门面
 * @author XCB
 */
var fs = require('fs');
var util = require('util');
var Task = require('./Task');
var DeployTask = require('./DeployTask');
var ReleaseTask = require('./ReleaseTask');
var RuleMap = require('./RuleMap');

var Neo = require('neo-core');
var Loaders = Neo.Loaders;

/**
 * soi 名字空间，soi中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace soi
 */
var soi = module.exports = global.exports = {};

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
soi.deploy = {
    _tasks: {},
    task: function (name, options) {
        this._tasks[name] = new DeployTask(name, options);
        return this._tasks[name];
    }
};

soi.release = {
    _tasks: {},
    task: function (name, options) {
        this._tasks[name] = new ReleaseTask(name, options);
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
    return soi;
};

/**
 * 执行相关的task操作
 * @param {String} type 执行deploy 或者 release 相关task
 * @param {String} task 具体的task名称
 * @param {?Object} argv 其他的命令行参数
 */
soi.run = function (type, task, argv) {
    type = type || 'release';
    task = task || 'dev';
    require(process.cwd() + '/demo.conf.js');
    if (!soi[type]._tasks[task]) {
        soi.log.error('Error occurred when run task ' + task + '. please check your config file \n');
    }
    else {
        var neo = new Neo(
            [
                new Loaders.JSLoader(),
                //new Loaders.CSSLoader(),
                new Loaders.ImageLoader(),
                new Loaders.SWFLoader()
            ],
            soi[type]._tasks[task].options.scandirs,
            soi[type]._tasks[task].options
        );
        neo.update('.cache', function(map, message) {
            // TODO
            //debugger;
            soi[type]._tasks[task].setMap(map).setArgs(type, argv).run();
            //fs.writeFileSync('map.json', JSON.stringify(map, null, 4), 'utf8');
        }, {forceRescan: true});
    }
};