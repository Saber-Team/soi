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
 * @file 命令行入口调用
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var node_path = require('path');
var argv = require('./util/argv');

// 全局对象
var soi = require('./soi');

/**
 * 显示的帮助信息.
 */
function describe() {
  console.log('s.o.i - Browser Side JavaScript Projects Builder.\n\n' +
      'Usage:\n' +
      '  $0 <command> [option]\n\n' +
      'Commands:\n' +
      '  release  [-- <clientArgs>] Compress and compile static code.\n' +
      '  preview  [-- <clientArgs>] Launch or stop local server.\n' +
      '  deploy   [-- <clientArgs>] Deploy static files to remote server.\n' +
      'Options:\n' +
      '  --help    | -h Print usage and options.\n' +
      '  --version | -v Print current version.');
}

/**
 * 解析命令行参数.
 * @param {object} argv e.g. ｀soi --file soi.conf.js｀
 *   会有以下结果:
 *   {
 *     _: [],
 *     file: "soi.conf.js"
 *   }
 */
function printHelp(argv) {
  if (argv.help || argv.h) {
    describe();
    process.exit(0);
  }

  // soi --version
  if (argv.version || argv.v) {
    soi.log.info('SOI version: ' + soi.const.version);
    process.exit(0);
  }
}

/**
 * 处理命令行命令及参数
 */
function processArgs() {
  var confFile = 'soi.conf.js';
  var arg = argv.parse(process.argv);
  var cmd = arg._.shift();

  if (!cmd) {
    return printHelp(arg);
  } else {
    if (arg.f || arg.file) {
      confFile = arg.f || arg.file
    }
    confFile = process.cwd() + node_path.sep + confFile;
    switch(cmd) {
      case 'deploy':
        try {
          require(confFile);
        } catch (err) {
          soi.log.error('Can\'t read configure file located at \n  ' +  confFile);
          process.exit(0);
        }
        soi.run('deploy', cmd, arg);
        break;
      case 'release':
        try {
          // 执行配置文件中的代码
          require(confFile);
        } catch (err) {
          soi.log.error('Can\'t read configure file located at \n  ' + confFile);
          process.exit(0);
        }
        // soi release [task]
        soi.run('release', cmd, arg);
        break;
      default:
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(0);
        break;
    }
  }
}

// 导出
exports.run = processArgs;