/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * @file server命令
 * @author AceMood
 */

'use strict';

const log         = require("et-util-logger");
var __presetMods  = Object.create(null);

exports.init = function(options) {
  options.keys().forEach(key => {
    if (__presetMods[key] &&
        (__presetMods[key].version === options[key].version)) {
      soi.log.warn(
          `soi install package ${key} @${options[key].version} already exist.\n`
      );
    }
    __presetMods[key] = options[key];
  });
};

exports.execute = function(modName, argv) {
  soi.log = new log.Logger(soi.config.get('logLevel'));
  if (!modName) {
    soi.log.error();
  }

  let task = __releaseTasks[taskName];
  if (!task) {
    soi.log.error(`Can't run soi install ${taskName}.`);
    process.exit(0);
  }

  task
    // 设置命令行参数
      .setArgs({taskName: taskName, argv: argv})
      .run();
};