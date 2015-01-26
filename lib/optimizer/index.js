// system modules
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// custom modules
var utils = require('../utils');
var clean = require('./clean/clean');
var constants = require('./constants');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');

// optimizer plugin's configuration
var OPTIONS;
var defaultOption = require('./conf/conf-optimizer');


/**
 * create resource
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
        'Can\'t parse static bundles without files field.'
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
  if (OPTIONS.base_dir === 'cwd' || OPTIONS.base_dir === './') {
    OPTIONS.base_dir = utils.normalizeSysPath(process.cwd() + '/');
  } else {
    OPTIONS.base_dir = utils.normalizeSysPath(
      path.resolve(process.cwd() + '/', OPTIONS.base_dir));
  }

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

// exports
var exports = module.exports = function(config) {
  OPTIONS = Object.create(defaultOption);
  // read user-defined config and mixin default options
  utils.extend(OPTIONS, config.optimizer || {});
  // added default ones, because we donot read in it as first
  // calling soi.config.set
  soi.config.set({
    optimizer: OPTIONS
  });

  // step 1 optimizer.config fields' as abs path
  processConfigOptions();

  // step2 resolve all static assets and create resources
  parseBundlesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
};