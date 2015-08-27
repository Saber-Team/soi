/**
 * @fileoverview 命令行入口调用
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

// 加载依赖模块
var optimist = require('optimist');

// 全局对象
var soi = require('./soi');

/**
 * 显示的帮助信息.
 */
var describe = function() {
  optimist.usage('s.o.i - Browser Side JavaScript Projects Builder.\n\n' +
      'Usage:\n' +
      '  $0 <command> [option]\n\n' +
      'Commands:\n' +
      '  release  [-- <clientArgs>] Build and compress static code.\n' +
      '  server   [-- <clientArgs>] Launch or stop local server.\n' +
      '  deploy   [-- <clientArgs>] Deploy static files to remote server.\n' +
      'Options:\n' +
      '  --help    | -h Print usage and options.\n' +
      '  --version | -v Print current version.');
};


/**
 * 解析命令行参数.
 * @param {Object} argv e.g. ｀soi --file soi.conf.js｀
 *   会有以下结果:
 *   {
 *     _: [],
 *     file: "soi.conf.js",
 *     $0: "nodejs/node.exe soi-cli/bin/soi"
 *   }
 */
function processArgs(argv) {
  // soi --help
  if (argv.help || argv.h) {
    optimist.showHelp();
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
function processCmdArgs() {
  var argv = optimist.parse(process.argv.slice(2));
  // console.log(argv);
  var cmd = argv._.shift();
  var plugins;

  describe();

  if (!cmd) {
    return processArgs(argv);
  } else {
    var conf = '/soi.conf.js';
    if (argv.f || argv.file) {
      conf = argv.f || argv.file
    }

    // console.log(process.cwd());
    conf = process.cwd() + '/' + conf;

    switch (cmd) {
      case 'optimize':
        try {
          // 执行配置文件中的代码
          require(conf);
        } catch (err) {
          soi.log.error(
              'Error occurred when reading configure file located at \n  ' +
              conf);
          process.exit(1);
        }
        plugins = soi.findPluginsByCommand(cmd);
        for (var i = 0; i < plugins.length; ++i) {
          soi().use(plugins[i]);
        }
        break;
      case 'deploy':
        try {
          // 执行配置文件中的代码
          require(conf);
        } catch (err) {
          soi.log.error(
                  'Error occurred when reading configure file located at \n  ' +
                  conf);
          process.exit(1);
        }
        // soi deploy
        soi().deploy();
        break;
      case 'release':
        try {
          // 执行配置文件中的代码
          require(conf);
        } catch (err) {
          soi.log.error(
                  'Error occurred when reading configure file located at \n  ' +
                  conf);
          process.exit(1);
        }
        // soi release [task]
        soi().release(argv._[0]);
        break;
      case 'server':
        try {
          // 执行配置文件中的代码
          require(conf);
        } catch (err) {
          soi.log.error(
                  'Error occurred when reading configure file located at \n  ' +
                  conf);
          process.exit(1);
        }

        if (argv._[0] === 'start') {
          soi().server().start();
        } else if (argv._[0] === 'stop') {
          soi().server().stop();
        }
        break;
      default:
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
    }
  }
}


/** 启动 */
function run() {
  // 处理命令行参数
  processCmdArgs();
  soi().go();
}


// exports
exports.run = run;

run();