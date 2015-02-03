// 3rd-party
var JSHint = require('jshint');
var chalk = require('chalk');

// Custom
var utils = require('../utils');


function lint(filepath) {
  debugger
}

function getDefaultRules() {
  var OPTIONS = Object.create(null);
  JSHint.getRules().forEach(function(rule) {
    OPTIONS[rule.id] = 1;
  });
  return OPTIONS;
  //require('./conf/conf-csslint');
}

// exports
exports.lint = lint;
exports.getDefaultRules = getDefaultRules;