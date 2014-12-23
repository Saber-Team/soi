// system modules
var fs = require('fs');
var path = require('path');

// custom modules
var utils = require('./utils');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');


// config file
// todo read from cmd or cwd

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


// process all relative paths in config file
function processConfigOptions() {
  ['dist_dir', 'module_loader', 'output_file', 'output_base']
    .forEach(function(item) {
      if (SOI_CONFIG[item]) {
        SOI_CONFIG[item] = path.resolve(
          SOI_CONFIG.base_dir, SOI_CONFIG[item]);
      }
    });

  if (SOI_CONFIG.input_file) {
    SOI_CONFIG.input_file.forEach(function(input) {
      input.path = path.resolve(SOI_CONFIG.base_dir,input.path);
    });
  }

  // newly added
  if (SOI_CONFIG.bundles.img) {
    SOI_CONFIG.bundles.img.forEach(function(pkg) {
      if (!pkg.files) {
        throw 'Can\'t parse image bundles without files field.';
      }
      pkg.input = null;
      pkg.defer = false;
      // normalize dist_dir
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }

  if (SOI_CONFIG.bundles.swf) {
    SOI_CONFIG.bundles.swf.forEach(function(pkg) {
      if (!pkg.files) {
        throw 'Can\'t parse swf bundles without files field.';
      }
      pkg.input = null;
      pkg.defer = false;
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }

  if (SOI_CONFIG.bundles.svg) {
    SOI_CONFIG.bundles.svg.forEach(function(pkg) {
      if (!pkg.files) {
        throw 'Can\'t parse svg bundles without files field.';
      }
      pkg.input = null;
      pkg.defer = false;
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }

  if (SOI_CONFIG.bundles.font) {
    if (!pkg.files) {
      throw 'Can\'t parse font bundles without files field.';
    }
    SOI_CONFIG.bundles.font.forEach(function(pkg) {
      pkg.input = null;
      pkg.defer = false;
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }

  if (SOI_CONFIG.bundles.css) {
    SOI_CONFIG.bundles.css.forEach(function(pkg) {
      if (pkg.input) {
        pkg.input = path.resolve(SOI_CONFIG.base_dir, pkg.input);
        // ignore files field
        pkg.files = null;
      } else if (!pkg.files) {
        throw 'Can\'t parse css bundles without input & files fields.';
      }
      pkg.defer = pkg.defer || false;
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }

  if (SOI_CONFIG.bundles.js) {
    SOI_CONFIG.bundles.js.forEach(function(pkg) {
      if (pkg.input) {
        pkg.input = path.resolve(SOI_CONFIG.base_dir, pkg.input);
      } else {
        throw 'Can\'t parse js bundles without input field.';
      }
      pkg.input = path.resolve(SOI_CONFIG.base_dir, pkg.input);
      pkg.defer = pkg.defer || false;
      pkg.dist_dir = pkg.dist_dir ? path.resolve(
        SOI_CONFIG.base_dir, pkg.dist_dir) + '/' :
        SOI_CONFIG.dist_dir;
    });
  }
}


// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory
    .getInstance('css')
    .resolve();

  ResolverFactory
    .getInstance('js')
    .resolve();
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