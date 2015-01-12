// system modules
var fs = require('fs');
var path = require('path');
var optimist = require('optimist');

// custom modules
var utils = require('./utils');
var constants = require('./constants');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');


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
    global.SOI_CONFIG = require(configFile);
  } else {
    // config file
    // console.log(process.cwd());
    global.SOI_CONFIG = require(process.cwd() + '/soi.conf');
  }
};

// process command line arguments
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
        console.error('Unknown command "' + cmd + '".');
        process.exit(1);
        break;
    }
  }
}

// create all resources
function parseBundlesOptions() {
  ProcesssorFactory
    .getInstance('font')
    .traverse();

  ProcesssorFactory
    .getInstance('swf')
    .traverse();

  ProcesssorFactory
    .getInstance('htc')
    .traverse();

  ProcesssorFactory
    .getInstance('img')
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

  if (SOI_CONFIG.bundles.htc) {
    processStaticBundles(SOI_CONFIG.bundles.htc);
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

  // step2 resolve all static assets and create resources
  parseBundlesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
}

// export
exports.config = function(target) {
  utils.extend(SOI_CONFIG, target);
};
exports.processCmdArgs = processCmdArgs;
exports.processConfigOptions = processConfigOptions;
exports.parseBundlesOptions = parseBundlesOptions;
exports.resolveFiles = resolveFiles;
exports.run = run;