// 3rd-party
var CSSLint = require('csslint').CSSLint;
var chalk = require('chalk');

// Custom
var utils = require('../utils');

var ruleset = Object.create(null);
var options = JSON.parse(utils.readFile('./.csslintrc', {
  encoding: soi().ENV.config.encoding
}));

// For each rule, a value of false ignores the rule,
// a value of 2 will set it to become an error.
// Otherwise all rules are considered warnings.
CSSLint.getRules().forEach(function(rule) {
  if (options[rule.id]) {
    ruleset[rule.id] = 1;
  }
});

for (var rule in options) {
  // set to false
  if (!options[rule]) {
    delete ruleset[rule];
  } else {
    ruleset[rule] = options[rule];
  }
}

/**
 * lint css file
 * @param {String} filepath
 */
function lint(filepath) {
  var file = utils.readFile(filepath),
    message = 'Linting ' + chalk.cyan(filepath) + '...',
    result;

  // skip empty files
  if (file.length) {
    result = CSSLint.verify(file, ruleset);
    if (result.messages.length) {
      console.warn(message);
    }

    result.messages.forEach(function(message) {
      var offenderMessage;
      if (typeof message.line !== 'undefined') {
        offenderMessage =
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

// exports
exports.lint = lint;