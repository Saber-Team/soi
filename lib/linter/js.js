'use strict';

// 3rd-party
var path = require('path');
var jshintcli = require('jshint/src/cli');
var chalk = require('chalk');

// Custom
var utils = require('../utils');


// Select a reporter
// Copied from jshint/src/cli/cli.js until that part is exposed
function selectReporter(options) {
  switch (true) {
    // JSLint reporter
    case options.reporter === 'jslint':
    case options['jslint-reporter']:
      options.reporter = 'jshint/src/reporters/jslint_xml.js';
      break;

    // CheckStyle (XML) reporter
    case options.reporter === 'checkstyle':
    case options['checkstyle-reporter']:
      options.reporter = 'jshint/src/reporters/checkstyle.js';
      break;

    // Reporter that displays additional JSHint data
    case options['show-non-errors']:
      options.reporter = 'jshint/src/reporters/non_error.js';
      break;

    // Custom reporter
    case options.reporter !== undefined:
      options.reporter = path.resolve(process.cwd(), options.reporter);
  }

  var reporter;
  if (options.reporter) {
    try {
      reporter = require(options.reporter).reporter;
    } catch (err) {
      console.log(
        chalk.bgRed.bold(err.message) +
          '\nFound in jslinter.selectReporter method'
      );
      process.exit(1);
    }
  }

  return reporter;
}

/**
 * lint
 * @param {!String} filepath The js file to be linted.
 * @param {?Function} done Callback function.
 */
function lint(filepath, done) {
  console.log(chalk.blue.bold('Lint file at ' + filepath));

  var options = soi().ENV.config.linter.js || {};

  var cliOptions = {
    verbose: soi().ENV.config.linter.js.output
  };

  // A list ignored files
  if (options.ignores) {
    if (typeof options.ignores === 'string') {
      options.ignores = [options.ignores];
    }
    cliOptions.ignores = options.ignores;
  }

  // Get reporter output directory for relative paths in reporters
  if (options.hasOwnProperty('reporterOutput')) {
    var reporterOutputDir = path.dirname(options.reporterOutput);
  }

  // Select a reporter to use
  var reporter = selectReporter(options);

  if (options.jshintrc) {
    // Read JSHint options from a specified jshintrc file.
    cliOptions.config = jshintcli.loadConfig(options.jshintrc);
  } else {
    options.devel = options.debug = soi().ENV.config.linter.js.debug;
    if (options.debug) {
      options.maxerr = Infinity;
    }
    // pass all of the remaining options directly to jshint
    cliOptions.config = soi().ENV.config.linter.js.rules;
  }

  // Run JSHint on all file and collect results/data
  var allResults = [];
  var allData = [];
  cliOptions.args = [filepath];
  cliOptions.reporter = function(results, data) {
    results.forEach(function(datum) {
      datum.file = reporterOutputDir ?
        path.relative(reporterOutputDir, datum.file) : datum.file;
    });
    reporter(results, data, options);
    allResults = allResults.concat(results);
    allData = allData.concat(data);
  };
  jshintcli.run(cliOptions);
  if (done) {
    done(allResults, allData);
  }
}

function getDefaultRules() {
  return require('./conf/conf-jshint');
}

// exports
exports.lint = lint;
exports.getDefaultRules = getDefaultRules;