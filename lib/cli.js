// Built-in
var optimist = require('optimist');
var chalk = require('chalk');

// load global object
var soi = require('./soi');
var constants = require('./constants');


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
      '  init Initialize an empty project.\n' +
      '  help Print usage and options.\n' +
      '  optimize Print usage and options.\n' +
      'Options:\n' +
      '  --help | -h Print usage and options.\n' +
      '  --version | -v Print current version.\n' +
      '  --file |-f Indicate the soi configure file path.');
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
    console.log('SOI version: ' + constants.VERSION);
    process.exit(0);
  }

  // soi --file conf.js
  if (argv.file || argv.f) {
    var configFile = argv.file;
    // default config file (if exists)
    if (!fs.existsSync(configFile)) {
      console.log(chalk.bgRed.bold(
          'No configure file located at ' + configFile + '.'));
      process.exit(1);
    }

    configFile = path.resolve(configFile);
    // console.log(configFile);
    // only executing configuration code
    require(configFile);
  } else {
    // config file
    // console.log(process.cwd());
    // only executing configuration code
    require(process.cwd() + '/soi.conf');
  }
};

/**
 * process command line arguments
 */
function processCmdArgs() {
  var argv = optimist.parse(process.argv.slice(2));
  // console.log(argv);
  var cmd = argv._.shift();

  describe();
  if (!cmd) {
    return processArgs(argv);
  } else {
    switch (cmd) {
      case 'optimize':
        soi().use(require('./optimizer/index'));
        break;
      case 'startserver':
        console.log(chalk.bgRed.bold('Unknown command "' + cmd + '".'));
        process.exit(1);
        break;
      case 'lint':
        console.log(chalk.bgRed.bold('Unknown command "' + cmd + '".'));
        process.exit(1);
        break;
      default:
        console.log(chalk.bgRed.bold('Unknown command "' + cmd + '".'));
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