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

const pkgInfo   = require('../package');
const node_path = require('path');
const argv      = require('./util/argv');

// 全局对象
var soi = require('./soi');

/**
 * 显示的帮助信息.
 */
function showHelpInfo() {
  console.log('s.o.i - Browser Side JavaScript Projects Build Tool.\n\n' +
      'Usage:\n' +
      '  soi <command> [option]\n\n' +
      'Commands:\n' +
      '  release  [-- <clientArgs>] Compress and compile static code.\n' +
      '  install  [-- <clientArgs>] Install specified components or modules.\n' +
      '  server   [-- <clientArgs>] Launch or stop local server.\n' +
      '  deploy   [-- <clientArgs>] Deploy static files to remote server.\n\n' +
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
    showHelpInfo();
    process.exit(0);
  }

  // soi --version
  if (argv.version || argv.v) {
    console.log(`soi version: ${pkgInfo.version}`);
    process.exit(0);
  }
}

/**
 * 处理命令行命令及参数
 */
function run() {
  process.title = 'soi';

  let confFile = 'soi.conf.js';
  let arg = argv.parse(process.argv);
  let cmd = arg._.shift();

  if (!cmd) {
    return printHelp(arg);
  } else {
    if (arg.f || arg.file) {
      confFile = arg.f || arg.file
    }
    confFile = process.cwd() + node_path.sep + confFile;

    let command = soi.queryCommand(cmd);
    if (!command) {
      soi.log.error(`Unknown command ${cmd}.`);
      process.exit(0);
    }

    try {
      require(confFile);
    } catch (err) {
      soi.log.error(`Can't read configure file located at \n  ${confFile}`);
      process.exit(0);
    }

    command.execute(arg._.shift(), arg);
  }
}

exports.run = run;