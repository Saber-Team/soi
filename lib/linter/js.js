
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