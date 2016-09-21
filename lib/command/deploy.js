/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file deploy命令
 * @author AceMood
 */

'use strict';

const log         = require("et-util-logger");
const DeployTask  = require('../DeployTask');
var __deployTasks = Object.create(null);

exports.task = function(name, options) {
    __deployTasks[name] = new DeployTask(name, options);
    return __deployTasks[name];
};

exports.execute = function(taskName, argv) {
    soi.log = new log.Logger(soi.config.get('logLevel'));
    taskName = taskName || 'default';
    let task = __deployTasks[taskName];
    if (!task) {
        soi.log.error(`Can't run soi deploy ${taskName}. No such task exists.`);
        process.exit(0);
    }

    task
        // 设置命令行参数
        .setArgs({taskName: taskName, argv: argv})
        // 应用插件
        .applyPlugin()
        .run();
};