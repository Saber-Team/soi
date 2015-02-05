// system modules
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// custom modules
var clean = require('./clean/clean');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');

// optimizer plugin's configuration
var OPTIONS;
var defaultOption = require('./conf/conf-optimizer');


/**
 * Create resource
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
    pkg.dist_dir = soi.utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(OPTIONS.base_dir, pkg.dist_dir) + '/' :
      OPTIONS.dist_dir);

    soi.utils.mkdir(pkg.dist_dir);
  });
}

/**
 * Deal with js css dynamic resource and so on.
 * @param {Array} bundles
 */
function processDynamicBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (pkg.input) {
      pkg.input = soi.utils.normalizeSysPath(
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
    pkg.dist_dir = soi.utils.normalizeSysPath(pkg.dist_dir ?
      path.resolve(OPTIONS.base_dir, pkg.dist_dir) + '/' :
      OPTIONS.dist_dir);

    soi.utils.mkdir(pkg.dist_dir);
  });
}

// process all relative paths in config file
function processConfigOptions() {
  if (OPTIONS.base_dir === 'cwd' || OPTIONS.base_dir === './') {
    OPTIONS.base_dir = soi.utils.normalizeSysPath(process.cwd() + '/');
  } else {
    OPTIONS.base_dir = soi.utils.normalizeSysPath(
      path.resolve(process.cwd() + '/', OPTIONS.base_dir) + '/');
  }

  if (OPTIONS.dist_dir) {
    OPTIONS.dist_dir = soi.utils.normalizeSysPath(
        path.resolve(OPTIONS.base_dir, OPTIONS.dist_dir) + '/');
  }
  if (OPTIONS.module_loader) {
    OPTIONS.module_loader = soi.utils.normalizeSysPath(
        path.resolve(OPTIONS.base_dir, OPTIONS.module_loader));
  }
  if (OPTIONS.map_file) {
    OPTIONS.map_file = soi.utils.normalizeSysPath(
        path.resolve(OPTIONS.base_dir, OPTIONS.map_file));
  }
  if (OPTIONS.output_base) {
    OPTIONS.output_base = soi.utils.normalizeSysPath(
        path.resolve(OPTIONS.base_dir, OPTIONS.output_base) + '/');
  }

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

  // added default ones, because we don't read in it as first
  // calling soi.config.extend
  soi.config.extend({
    optimizer: OPTIONS
  });
}

// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory.getInstance('css').resolve();
  ResolverFactory.getInstance('js').resolve();
}

// main plugin
function plugin(config) {
  OPTIONS = Object.create(defaultOption);
  // read user-defined config and mixin default options
  soi.utils.extend(OPTIONS, config.optimizer || {});

  // step 1 optimizer.config fields' as abs path
  processConfigOptions();

  // step2 resolve all static assets and create resources
  parseBundlesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
}

// clear refs
plugin.reset = function() {
  require('./resource/table').clear();
  require('./module/manager').clear();
};

// exports
module.exports = plugin;