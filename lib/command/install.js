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