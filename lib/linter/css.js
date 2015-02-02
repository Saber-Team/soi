// 3rd-party
var CSSLint = require('csslint').CSSLint;
var chalk = require('chalk');

// Custom
var utils = require('../utils');

/**
 * lint css file
 * @param {String} filepath
 */
function lint(filepath) {
  var content = utils.readFile(filepath, {
      encoding: soi().ENV.config.linter.css.encoding || 'utf8'
    }),
    message = 'Linting ' + chalk.cyan(filepath) + '...',
    result;

  var ruleset = soi().ENV.config.linter.css.rules;

  // For each rule, a value of false ignores the rule,
  // a value of 2 will set it to become an error.
  // Otherwise all rules are considered warnings.

  // skip empty files
  if (content.length) {
    result = CSSLint.verify(content, ruleset);
    if (result.messages.length) {
      console.warn(message);
    }

    result.messages.forEach(function(message) {
      var offenderMessage;
      if (typeof message.line !== 'undefined') {
        offenderMessage =
          chalk.yellow('L' + message.line) +
          chalk.yellow('L' + message.line) +
          chalk.red(':') +
          chalk.yellow('C' + message.col);
      } else {
        offenderMessage = chalk.yellow('GENERAL');
      }

      console.log(chalk.red('[') + offenderMessage + chalk.red(']') + '\n');
      console[message.type === 'error' ? 'error' : 'log'](
          message.type.toUpperCase() + ': ' +
          message.message + ' ' +
          message.rule.desc +
          ' (' + message.rule.id + ')' +
          ' Browsers: ' + message.rule.browsers
      );

      if (message.type === 'error') {
        process.exit(1);
      }
    });
  }
}

function getDefaultRules() {
  var OPTIONS = Object.create(null);
  CSSLint.getRules().forEach(function(rule) {
    OPTIONS[rule.id] = 1;
  });
  return OPTIONS;
  //require('./conf/conf-csslint');
}

// exports
exports.lint = lint;
exports.getDefaultRules = getDefaultRules;