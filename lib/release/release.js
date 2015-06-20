/**
 * @fileoverview release对应`soi release [task]`命令，完成本地的打包构建产出资源表。
 *
 */

// system modules
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// custom modules
var clean = require('./clean/clean');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');

var OPTIONS;
var defaultOption = {
  domain: '/',
  obscure: true
};
// 配置对象
var configObject;


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
  var vrd = OPTIONS.virtualRootDir;
  // 标准化virtualRootDir属性
  if (vrd === 'cwd' || vrd === './' || vrd === '/') {
    OPTIONS.virtualRootDir = soi.utils.normalizeSysPath(process.cwd() + '/');
  } else {
    OPTIONS.virtualRootDir = soi.utils.normalizeSysPath(
            path.resolve(process.cwd() + '/', vrd) + '/');
  }

  // clean(OPTIONS.dist_dir, function(err) {});

  // newly added
  if (OPTIONS.pack.img) {
    processStaticBundles(OPTIONS.pack.img);
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
    release: OPTIONS
  });
}

// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory.getInstance('css').resolve();
  ResolverFactory.getInstance('js').resolve();
}


/**
 * 构建
 * @param {String} task 要构建的任务名称
 */
function release(task) {
  if (!soi().ENV.config.release || !soi().ENV.config.release[task]) {
    soi.log.error('Try to release task: ' + task + ' do not exists.');
    process.exit(1);
  }

  var conf = configObject || soi().ENV.config.release[task],
      OPTIONS = Object.create(defaultOption);
  // read user-defined config and mixin default options
  soi.utils.extend(OPTIONS, conf || {});

  // step 1 optimizer.config fields' as abs path
  processConfigOptions();

  // step2 resolve all static assets and create resources
  parseBundlesOptions();

  // step3 combo and compress js & css files
  resolveFiles();
}


// clear refs
release.reset = function() {
  require('./resource/table').clear();
  require('./module/manager').clear();
};


/**
 * 设置配置对象
 * @param {Object} obj
 */
function config(obj) {
  configObject = obj;
}


exports.release = release;
exports.config = config;