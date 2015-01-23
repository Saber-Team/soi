// system modules
var fs = require('fs');
var path = require('path');
var optimist = require('optimist');
var chalk = require('chalk');

// custom modules
var utils = require('./utils');
var clean = require('./clean/clean');
var constants = require('./constants');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');

// optimizer plugin's configuration
var OPTIONS;

/**
 * Init empty project skeleton.
 * todo
 */
var init = function() {
  /*
   fs.mkdirSync('./project/');
   fs.mkdirSync('./project/lib/');

   fs.mkdirSync('./project/dist/');
   fs.mkdirSync('./project/dist/js/');
   fs.mkdirSync('./project/dist/css/');
   fs.mkdirSync('./project/dist/img/');
   fs.mkdirSync('./project/dist/swf/');
   fs.mkdirSync('./project/dist/font/');

   fs.mkdirSync('./project/assets/');
   fs.mkdirSync('./project/assets/js/');
   fs.mkdirSync('./project/assets/css/');
   fs.mkdirSync('./project/assets/img/');
   fs.mkdirSync('./project/assets/swf/');
   fs.mkdirSync('./project/assets/font/');*/


  // todo
  process.exit(0);
};

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
      '  $0 <command>\n\n' +
      'Commands:\n' +
      '  init Initialize an empty project.\n' +
      '  help Print usage and options.\n' +
      'Options:\n' +
      '  --help Print usage and options.\n' +
      '  --version Print current version.\n' +
      '  --file Indicate the soi configure file path.\n' +
      'Run --help to see its description and available options.');
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
  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  if (argv.version) {
    console.log('SOI version: ' + constants.VERSION);
    process.exit(0);
  }

  if (argv.file) {
    var configFile = argv.file;
    // default config file (if exists)
    if (!fs.existsSync(configFile)) {
      console.error('No configure file located at ' + configFile + '.');
      process.exit(1);
    }

    configFile = path.resolve(configFile);
    // console.log(configFile);
    global.OPTIONS = require(configFile);
  } else {
    // config file
    // console.log(process.cwd());
    global.OPTIONS = require(process.cwd() + '/soi.conf');
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
      case 'init':
        init();
        break;
      case 'help':
        help();
        break;
      default:
        console.log(chalk.bgRed.bold('Unknown command "' + cmd + '".'));
        process.exit(1);
        break;
    }
  }
}

/**
 * 创建资源
 */
function parseBundlesOptions() {
  ProcesssorFactory.getInstance('font').traverse();
  ProcesssorFactory.getInstance('swf').traverse();
  ProcesssorFactory.getInstance('htc').traverse();
  ProcesssorFactory.getInstance('img').traverse();
  ProcesssorFactory.getInstance('css').traverse();
  ProcesssorFactory.getInstance('js').traverse();
}

/**
 * Deal with swf img static resource and so on.
 * @param {Array} bundles
 */
function processStaticBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (!pkg.files) {
      console.log(chalk.bgRed.bold(
        'Can\'t parse static bundles without files field. \n'
      ));
      process.exit(1);
    }
    pkg.input = null;
    pkg.defer = false;
    // normalize dist_dir
    pkg.dist_dir = utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(OPTIONS.base_dir, pkg.dist_dir) + '/' :
      OPTIONS.dist_dir);

    utils.mkdir(pkg.dist_dir);
  });
}

/**
 * Deal with js css dynamic resource and so on.
 * @param {Array} bundles
 */
function processDynamicBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (pkg.input) {
      pkg.input = utils.normalizeSysPath(
        path.resolve(OPTIONS.base_dir, pkg.input));
      // ignore files field
      pkg.files = null;
    } else if (!pkg.files) {
      console.log(chalk.bgRed.bold(
        'Can\'t parse static bundles without input & files field. \n'
      ));
      process.exit(1);
    }
    pkg.defer = pkg.defer || false;
    pkg.dist_dir = utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(OPTIONS.base_dir, pkg.dist_dir) + '/' :
      OPTIONS.dist_dir);

    utils.mkdir(pkg.dist_dir);
  });
}

// process all relative paths in config file
function processConfigOptions() {
  ['dist_dir', 'module_loader', 'output_base']
    .forEach(function(item) {
      if (OPTIONS[item]) {
        OPTIONS[item] = utils.normalizeSysPath(path.resolve(
          OPTIONS.base_dir, OPTIONS[item]));
      }
    });

  // clean(OPTIONS.dist_dir, function(err) {});

  // newly added
  if (OPTIONS.bundles.img) {
    processStaticBundles(OPTIONS.bundles.img);
  }

  if (OPTIONS.bundles.swf) {
    processStaticBundles(OPTIONS.bundles.swf);
  }

  if (OPTIONS.bundles.htc) {
    processStaticBundles(OPTIONS.bundles.htc);
  }

  if (OPTIONS.bundles.font) {
    processStaticBundles(OPTIONS.bundles.font);
  }

  if (OPTIONS.bundles.css) {
    processDynamicBundles(OPTIONS.bundles.css);
  }

  if (OPTIONS.bundles.js) {
    processDynamicBundles(OPTIONS.bundles.js);
  }
}

// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory.getInstance('css').resolve();
  ResolverFactory.getInstance('js').resolve();
}

var exports = module.exports = function(config) {
  OPTIONS = config.optimizer || {};

  // 处理命令行参数
  processCmdArgs();

  // step 1 optimizer.config各字段路径绝对化处理
  processConfigOptions();

  // step2 resolve all static assets and create resources
  parseBundlesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
};