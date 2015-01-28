// system modules
var chalk = require('chalk');
var glob = require('glob');

// custom modules
var utils = require('../utils');
var constants = require('./constants');
// See: https://www.npmjs.com/package/glob
var defaultGlobOptions = {
  dot:false
};

// optimizer plugin's configuration
var OPTIONS;
var csslint = require('./css');
var jshint = require('./js');

// main plugin
function plugin(config) {
  var linter = config.linter;

  OPTIONS = Object.create(null);
  // read user-defined config and mixin default options
  Object.defineProperties(OPTIONS, {
    'css': {
      value: require('./conf/conf-csslint'),
      enumerable: true,
      writable: true
    },
    'js': {
      value: require('./conf/conf-jshint'),
      enumerable: true,
      writable: true
    }
  });

  if (linter.css && linter.css.rules) {
    utils.extend(OPTIONS.css, linter.css || {});
  }
  if (linter.js && linter.js.rules) {
    utils.extend(OPTIONS.js, linter.js || {});
  }

  // added default ones, because we don't read in it as first
  // calling soi.config.set
  soi.config.set({
    linter: OPTIONS
  });

  if (soi().ENV.linter.css.files) {
    var fs = soi().ENV.linter.css.files;
    fs.forEach(function(pattern) {
      var files = glob.sync(pattern, defaultGlobOptions);
      files.forEach(function(file) {
        debugger;
        csslint.lint(file);
      });
    });
  }
}

// clear refs
plugin.reset = function() {

};

// exports
var exports = module.exports = plugin;