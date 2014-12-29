var path = require('path');
var utils = require('../utils');


function Target(conf) {
  this.input = conf.input;
  this.files = null;
  this.exclude = conf.exclude || Object.create(null);
  this.defer = !!conf.defer;
  this.dist_file = conf.dist_file || 'build.js';
  this.dist_dir = conf.dist_dir || SOI_CONFIG.dist_dir;
}

Target.prototype.toString = function() {

};

Target.prototype.deserialize = function() {

};

module.exports = Target;