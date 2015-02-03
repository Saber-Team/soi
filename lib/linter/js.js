'use strict';

// 3rd-party
var path = require('path');
var JSHint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');
var chalk = require('chalk');

// Custom
var utils = require('../utils');


function lint(filepath, done) {
  debugger;

  var options = soi().ENV.config.linter.js || {};

  var cliOptions = {
    verbose: grunt.option('verbose'),
    extensions: ''
  };

  // A list of non-dot-js extensions to check
  if (options.extensions) {
    cliOptions.extensions = options.extensions;
    delete options.extensions;
  }

  // A list ignored files
  if (options.ignores) {
    if (typeof options.ignores === 'string') {
      options.ignores = [options.ignores];
    }
    cliOptions.ignores = options.ignores;
    delete options.ignores;
  }

  // Option to extract JS from HTML file
  if (options.extract) {
    cliOptions.extract = options.extract;
    delete options.extract;
  }

  // Get reporter output directory for relative paths in reporters
  if (options.hasOwnProperty('reporterOutput')) {
    var reporterOutputDir = path.dirname(options.reporterOutput);
    delete options.reporterOutput;
  }

  // Select a reporter to use
  var reporter = exports.selectReporter(options);

  // Remove bad options that may have came in from the cli
  ['reporter', 'jslint-reporter', 'checkstyle-reporter', 'show-non-errors'].forEach(function(opt) {
    if (options.hasOwnProperty(opt)) {
      delete options[opt];
    }
  });

  if (options.jshintrc === true) {
    // let jshint find the options itself
    delete cliOptions.config;
  } else if (options.jshintrc) {
    // Read JSHint options from a specified jshintrc file.
    cliOptions.config = jshintcli.loadConfig(options.jshintrc);
  } else {
    // Enable/disable debugging if option explicitly set.
    if (grunt.option('debug') !== undefined) {
      options.devel = options.debug = grunt.option('debug');
      // Tweak a few things.
      if (grunt.option('debug')) {
        options.maxerr = Infinity;
      }
    }
    // pass all of the remaining options directly to jshint
    cliOptions.config = options;
  }

  // Run JSHint on all file and collect results/data
  var allResults = [];
  var allData = [];
  cliOptions.args = files;
  cliOptions.reporter = function(results, data) {
    results.forEach(function(datum) {
      datum.file = reporterOutputDir ? path.relative(reporterOutputDir, datum.file) : datum.file;
    });
    reporter(results, data, options);
    allResults = allResults.concat(results);
    allData = allData.concat(data);
  };
  jshintcli.run(cliOptions);
  done(allResults, allData);
}

function getDefaultRules() {
  return require('./conf/conf-jshint');
}

// exports
exports.lint = lint;
exports.getDefaultRules = getDefaultRules;