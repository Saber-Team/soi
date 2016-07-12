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
 * @file release命令
 * @author AceMood
 */

'use strict';

const Neo         = require('neo-core');
const profiler    = require('../profiler');
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

  let loaders = task.options.loaders || [];
  task.options.logger = soi.log;
  let neo = new Neo(
      loaders,
      task.options.scandirs,
      task.options
  );

  profiler.record('scan:start');
  neo.update(task.cachedKey, map => {
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