// system modules
var fs = require('fs');
var path = require('path');

// custom modules
var utils = require('./utils');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');


// config file
// todo read from cmd or cwd
console.log(process.cwd());
global.SOI_CONFIG = require(process.cwd() + '/soi.conf');


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


function run() {
  // todo CMD LINE

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
exports.processConfigOptions = processConfigOptions;
exports.parseFilesOptions = parseFilesOptions;
exports.resolveFiles = resolveFiles;
exports.run = run;