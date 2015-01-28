// system modules
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// custom modules
var utils = require('../utils');
var constants = require('./constants');

// optimizer plugin's configuration
var OPTIONS;
var defaultCssOption = require('./conf/conf-csslint');
var defaultJsOption = require('./conf/conf-jshint');

// main plugin
function plugin(config) {
  OPTIONS = Object.create(null);
  // read user-defined config and mixin default options
  Object.defineProperties({
    'css': {
      value: utils.extend(defaultCssOption, config.linter.css || {}),
      enumerable: true
    },
    'js': {
      value: utils.extend(defaultJsOption, config.linter.js || {}),
      enumerable: true
    }
  });

  // added default ones, because we don't read in it as first
  // calling soi.config.set
  soi.config.set({
    linter: OPTIONS
  });
}

// clear refs
plugin.reset = function() {

};

// exports
var exports = module.exports = plugin;