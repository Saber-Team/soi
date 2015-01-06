// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var UglifyJS = require('uglify-js');

var utils = require('../utils');
var res = require('../resolver/jsRequireRes');


function search(code) {
  code = res.removeComments(code);
  return res.getRequireUrls(code);
}

function replace(code, origin, dist) {
  origin.forEach(function(url, i) {
    code = code.replace(url, dist[i]);
  });
  return code;
}

exports.replace = replace;
exports.search = search;