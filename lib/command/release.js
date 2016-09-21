/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file release命令
 * @author AceMood
 */

'use strict';

const log         = require("et-util-logger");
const ReleaseTask = require('../ReleaseTask');
var __releaseTasks= Object.create(null);

exports.task = function(name, options) {
    __releaseTasks[name] = new ReleaseTask(name, options);
    return __releaseTasks[name];
};

exports.execute = function(taskName, argv) {
    soi.log = new log.Logger(soi.config.get('logLevel'));
    taskName = taskName || 'default';
    let task = __releaseTasks[taskName];
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