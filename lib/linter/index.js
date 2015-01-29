// system modules
var chalk = require('chalk');
var glob = require('glob');

// custom modules
var utils = require('../utils');
//var constants = require('./constants');
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
      value: csslint.getDefaultRules(),
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
    utils.extend(OPTIONS.css, linter.css.rules);
  }
  if (linter.js && linter.js.rules) {
    utils.extend(OPTIONS.js, linter.js.rules);
  }

  // added default ones, because we don't read in it as first
  // calling soi.config.extend
  soi.config.extend({
    linter: OPTIONS
  });

  if (soi().ENV.config.linter.css.files) {
    var fs = soi().ENV.config.linter.css.files;
    fs.forEach(function(pattern) {
      var files = glob.sync(pattern, defaultGlobOptions);
      files.forEach(function(file) {
        var path = utils.normalizeSysPath(process.cwd() + '/' + file);
        csslint.lint(path);
      });
    });
  }

  /*
  if (soi().ENV.config.linter.js.files) {
    var fs = soi().ENV.config.linter.js.files;
    fs.forEach(function(pattern) {
      var files = glob.sync(pattern, defaultGlobOptions);
      files.forEach(function(file) {
        var path = utils.normalizeSysPath(process.cwd() + '/' + file);
        jslint.lint(path);
      });
    });
  }*/
}

// clear refs
plugin.reset = function() {

};

// exports
var exports = module.exports = plugin;