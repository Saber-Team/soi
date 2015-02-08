'use strict';

// Built-in
var optimist = require('optimist');

// load global object
var soi = require('./soi');


/**
 * Show help information.
 */
var help = function() {
  optimist.showHelp();
  process.exit(0);
};

/**
 * Show default help information.
 */
var describe = function() {
  optimist
    .usage('SOI - Browser Side JavaScript Projects Builder.\n\n' +
      'Usage:\n' +
      '  $0 <command> [option]\n\n' +
      'Commands:\n' +
      '  optimize [-- <clientArgs>] Build project.\n' +
      'Options:\n' +
      '  --help    | -h Print usage and options.\n' +
      '  --version | -v Print current version.');
};

/**
 * Resolve cmd args in details.
 * @param {Object} argv e.g. soi --file soi.conf.js
 *   will provide the args as:
 *   {
 *     _: [],
 *     file: "soi.conf.js",
 *     $0: "nodejs/node.exe soi-cli/bin/soi"
 *   }
 */
var processArgs = function(argv) {
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
};

/**
 * process command line arguments
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
    var conf = '/soi.conf';
    if (argv.f || argv.file) {
      conf = argv.f || argv.file
    }
    // console.log(process.cwd());
    conf = process.cwd() + '/' + conf;

    switch(cmd) {
      case 'install':
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
      case 'lint':
        try {
          // executing configuration file code
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
      case 'optimize':
        try {
          // executing configuration file code
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
      case 'commit':
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
      case 'release':
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
      case 'start':
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
      default:
        soi.log.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
    }
  }
}

// entry point
function run() {
  // deal with command line arguments
  processCmdArgs();
  // go
  soi().go();
}

// exports
exports.run = run;