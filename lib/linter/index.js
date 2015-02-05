'use strict';

// system modules
var chalk = require('chalk');
var glob = require('glob');
var hooker = require('hooker');

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


/**
 * Generate default options
 * @return {!Object}
 */
function createDefaultsOptions() {
  var options = Object.create(null);
  // read user-defined config and mixin default options
  Object.defineProperties(options, {
    'css': {
      value: {
        encoding: 'utf8',
        rules: csslint.getDefaultRules()
      },
      enumerable: true,
      writable: true
    },
    'js': {
      value: {
        encoding: 'utf8',
        debug: true,
        reporter: require('jshint-stylish'),
        rules: jshint.getDefaultRules()
      },
      enumerable: true,
      writable: true
    }
  });
  return options;
}

/**
 * Main entry point.
 * @param {!Object} config
 */
function plugin(config) {
  var linter = config.linter;

  OPTIONS = createDefaultsOptions();

  if (linter.css && linter.css.rules) {
    utils.extend(OPTIONS.css, linter.css, true);
  }
  if (linter.js && linter.js.rules) {
    utils.extend(OPTIONS.js, linter.js, true);
  }

  // added default ones, because we don't read in it as first
  // calling soi.config.extend
  soi.config.extend({
    linter: OPTIONS
  });

  // LINT
  /*if (soi().ENV.config.linter.css.files) {
    var fs = soi().ENV.config.linter.css.files;
    fs.forEach(function(pattern) {
      var files = glob.sync(pattern, defaultGlobOptions);
      files.forEach(function(file) {
        var path = utils.normalizeSysPath(process.cwd() + '/' + file);
        csslint.lint(path);
      });
    });
  }*/

  if (soi().ENV.config.linter.js.files) {
    var fs = soi().ENV.config.linter.js.files;
    fs = fs.map(function(pattern) {
      var files = glob.sync(pattern, defaultGlobOptions);
      return files.map(function(file) {
        return utils.normalizeSysPath(process.cwd() + '/' + file);
      });
    });
    fs = utils.flatten(fs);

    // Whether to output the report to a file
    var reporterOutput = soi().ENV.config.linter.js.reporterOutput;

    // Hook into stdout to capture report
    var output = '';
    if (reporterOutput) {
      hooker.hook(process.stdout, 'write', {
        pre: function (out) {
          output += out;
          return hooker.preempt();
        }
      });
    }

    jshint.lint(fs, function(results, data) {
      // Write the output of the reporter if wanted
      if (reporterOutput) {
        hooker.unhook(process.stdout, 'write');
        // reporterOutput = grunt.template.process(reporterOutput);
        var destDir = path.dirname(utils.normalizeSysPath(
          path.resolve(process.cwd() + '/' + reporterOutput)));
        if (!fs.existsSync(destDir)) {
          utils.mkdir(destDir);
        }
        utils.writeFile(reporterOutput, output, {
          encoding: 'utf8'
        });
        console.log(chalk.green('Report "' + reporterOutput + '" created.'));
      }
    });
  }
}

/**
 * After providing lint service, reset default options.
 * No side-effects on soi.conf.js config, just clear self.
 */
plugin.reset = function() {
  OPTIONS = createDefaultsOptions();
  soi.config.extend({
    linter: OPTIONS
  });
};

// exports
var exports = module.exports = plugin;