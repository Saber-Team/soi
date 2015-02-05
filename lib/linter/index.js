'use strict';

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

  if (soi().ENV.config.linter.js.files) {
    var fs = soi().ENV.config.linter.js.files;
    jshint.lint(fs);
    /*
     fs.forEach(function(pattern) {
     var files = glob.sync(pattern, defaultGlobOptions);
     files.forEach(function(file) {
     var path = utils.normalizeSysPath(process.cwd() + '/' + file);
     jshint.lint(path);
     });
     });*/
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      force: false,
      reporterOutput: null
    });

    // Report JSHint errors but dont fail the task
    var force = options.force;
    delete options.force;

    // Whether to output the report to a file
    var reporterOutput = options.reporterOutput;

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

    jshint.lint(this.filesSrc, options, function (results, data) {
      var failed = 0;
      if (results.length > 0) {
        // Fail task if errors were logged except if force was set.
        failed = force;
        if (jshint.usingGruntReporter === true) {

          var numErrors = grunt.util._.reduce(results, function (memo, result) {
            return memo + (result.error ? 1 : 0);
          }, 0);

          var numFiles = data.length;
          grunt.log.error(numErrors + ' ' + grunt.util.pluralize(numErrors, 'error/errors') + ' in ' +
            numFiles + ' ' + grunt.util.pluralize(numFiles, 'file/files'));
        }
      } else {
        if (jshint.usingGruntReporter === true && data.length > 0) {
          grunt.log.ok(data.length + ' ' + grunt.util.pluralize(data.length, 'file/files') + ' lint free.');
        }
      }

      // Write the output of the reporter if wanted
      if (reporterOutput) {
        hooker.unhook(process.stdout, 'write');
        reporterOutput = grunt.template.process(reporterOutput);
        var destDir = path.dirname(reporterOutput);
        if (!grunt.file.exists(destDir)) {
          grunt.file.mkdir(destDir);
        }
        grunt.file.write(reporterOutput, output);
        grunt.log.ok('Report "' + reporterOutput + '" created.');
      }

      done(failed);
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