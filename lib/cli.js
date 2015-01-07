// system modules
var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

// custom modules
var utils = require('./utils');
var constants = require('./constants');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');


// config file
// console.log(process.cwd());
global.SOI_CONFIG = require(process.cwd() + '/soi.conf');


/**
 * return only args that occur before `--`.
 * e.g. soi init --f soi.conf.js
 * will ignore all arguments after cmd: init.
 * @param {String} argv
 * @returns {String} command
 */
var argsBeforeDoubleDash = function(argv) {
  var idx = argv.indexOf('--');
  return idx === -1 ? argv : argv.slice(0, idx);
};

/**
 * Init empty project skeleton.
 * todo
 */
var init = function() {
  optimist
    .usage('Karma - Spectacular Test Runner for JavaScript.\n\n' +
      'INIT - Initialize a config file.\n\n' +
      'Usage:\n' +
      '  $0 init [<configFile>]')
    .describe('log-level', '<disable | error | warn | info | debug> Level of logging.')
    .describe('colors', 'Use colors when reporting and printing logs.')
    .describe('no-colors', 'Do not use colors when reporting or printing logs.')
    .describe('help', 'Print usage and options.');
};

/**
 * Show default help information.
 */
var describe = function() {
  optimist
    .usage('SOI - Browser Side JavaScript Projects Builder.\n\n' +
      'Usage:\n' +
      '  $0 <command>\n\n' +
      'Commands:\n' +
      '  start [<configFile>] [<options>] Start the server / do single run.\n' +
      '  init Initialize an empty project.\n' +
      '  run [<options>] [ -- <clientArgs>] Trigger a test run.\n' +
      '  completion Shell completion for karma.\n\n' +
      'Run --help with particular command to see its description and available options.')
    .describe('help', 'Print usage and options.')
    .describe('version', 'Print current version.');
};

var processArgs = function(argv, options, fs, path) {
  if (argv.help) {
    console.log(optimist.help());
    process.exit(0);
  }

  if (argv.version) {
    console.log('SOI version: ' + constants.VERSION);
    process.exit(0);
  }

  // TODO(vojta): warn/throw when unknown argument (probably mispelled)
  Object.getOwnPropertyNames(argv).forEach(function(name) {
    var argumentValue = argv[name];
    if (name !== '_' && name !== '$0') {
      if (Array.isArray(argumentValue)) {
        // If the same argument is defined multiple times, override.
        argumentValue = argumentValue.pop();
      }
      options[helper.dashToCamel(name)] = argumentValue;
    }
  });

  var configFile = argv._.shift();

  if (!configFile) {
    // default config file (if exists)
    if (fs.existsSync('./soi.conf.js')) {
      configFile = './soi.conf.js';
    } else if (fs.existsSync('./soi.conf.coffee')) {
      configFile = './soi.conf.coffee';
    }
  }

  options.configFile = configFile ? path.resolve(configFile) : null;

  return options;
};

// process command line arguments
function processCmdArgs() {
  var argv = optimist.parse(argsBeforeDoubleDash(process.argv.slice(2)));
  var options = {
    cmd: argv._.shift()
  };
  switch (options.cmd) {
    case 'init':
      init();
      break;
    default:
      describe();
      if (!options.cmd) {
        processArgs(argv, options, fs, path);
        console.error('Command not specified.');
      } else {
        console.error('Unknown command "' + options.cmd + '".');
      }
      optimist.showHelp();
      process.exit(1);
  }

  return processArgs(argv, options, fs, path);

  if (argv.f || argv.file) {
    // config file
    global.SOI_CONFIG = require(process.cwd() + '/soi.conf');
  }
}

// create all resources
function parseFilesOptions() {
  ProcesssorFactory
    .getInstance('image')
    .traverse();

  ProcesssorFactory
    .getInstance('css')
    .traverse();

  ProcesssorFactory
    .getInstance('js')
    .traverse();
}

// deal with swf & svg bundles
function processStaticBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (!pkg.files) {
      throw 'Can\'t parse static bundles without files field.';
    }
    pkg.input = null;
    pkg.defer = false;
    // normalize dist_dir
    pkg.dist_dir = utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
      SOI_CONFIG.dist_dir);
  });
}

// deal with js & css bundles
function processDynamicBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (pkg.input) {
      pkg.input = utils.normalizeSysPath(
        path.resolve(SOI_CONFIG.base_dir, pkg.input));
      // ignore files field
      pkg.files = null;
    } else if (!pkg.files) {
      throw 'Can\'t parse bundles without input & files fields.';
    }
    pkg.defer = pkg.defer || false;
    pkg.dist_dir = utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
      SOI_CONFIG.dist_dir);
  });
}

// process all relative paths in config file
function processConfigOptions() {
  ['dist_dir', 'module_loader', 'output_file', 'output_base']
    .forEach(function(item) {
      if (SOI_CONFIG[item]) {
        SOI_CONFIG[item] = utils.normalizeSysPath(path.resolve(
          SOI_CONFIG.base_dir, SOI_CONFIG[item]));
      }
    });

  // newly added
  if (SOI_CONFIG.bundles.img) {
    processStaticBundles(SOI_CONFIG.bundles.img);
  }

  if (SOI_CONFIG.bundles.swf) {
    processStaticBundles(SOI_CONFIG.bundles.swf);
  }

  if (SOI_CONFIG.bundles.svg) {
    processStaticBundles(SOI_CONFIG.bundles.svg);
  }

  if (SOI_CONFIG.bundles.font) {
    processStaticBundles(SOI_CONFIG.bundles.font);
  }

  if (SOI_CONFIG.bundles.css) {
    processDynamicBundles(SOI_CONFIG.bundles.css);
  }

  if (SOI_CONFIG.bundles.js) {
    processDynamicBundles(SOI_CONFIG.bundles.js);
  }
}

// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory.getInstance('css').resolve();
  ResolverFactory.getInstance('js').resolve();
}

// go
function run() {
  // CMD LINE
  processCmdArgs();

  // step 1 normalize all config paths
  processConfigOptions();

  // step2 resolve all assets and create resources
  parseFilesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
}


// export
exports.config = function(target) {
  utils.extend(SOI_CONFIG, target);
};
exports.processCmdArgs = processCmdArgs;
exports.processConfigOptions = processConfigOptions;
exports.parseFilesOptions = parseFilesOptions;
exports.resolveFiles = resolveFiles;
exports.run = run;