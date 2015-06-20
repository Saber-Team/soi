/**
 * @fileoverview 所有静态资源处理器的基类
 */


'use strict';


var path = require('path');
var fs = require('fs');


var utils = require('../utils');
var ExtMap = require('./extmap');
var Walker = require('../dirwalker/walker');
var Resource = require('../Resource/resource');
var ResourceTable = require('../resource/table');


/**
 * Class deal with static resource
 * @constructor
 */
var StaticProcessor = function() {
  this.options = soi().ENV.config.optimizer;
  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};


/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing file
 * @param {String} fileName File name of current dealing file
 */
StaticProcessor.prototype.process = function(base, fileName) {
  // absolute path of original file
  var _path = utils.normalizeSysPath(
    path.resolve(base, fileName));
  // get the relative path to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  var resource = Resource.create({
    origin  : origin,
    type    : this.type,
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });
  ResourceTable.register({
    type    : this.type,
    key     : _path,
    value   : resource
  });
};


/**
 * Create all resources
 */
StaticProcessor.prototype.traverse = function() {
  if (!this.options.bundles[this.type] ||
    this.options.bundles[this.type].length <= 0)
    return;
  // traverse img pkg list
  this.options.bundles[this.type].forEach(function(pkg) {
    this.currentDistDir = pkg.dist_dir;
    pkg.files.forEach(function(file) {
      // store the list item of current config
      this.currentFilesItem = file;
      var stat = fs.lstatSync(this.options.base_dir + file);

      if (stat.isFile() && ExtMap[this.type].test(file)) {
        this.process(this.options.base_dir, file);
      }
      else if (stat.isDirectory()) {
        var dir = path.resolve(this.options.base_dir, file);
        var walker = new Walker({
          dirname: dir
        });
        walker.walk(this.process.bind(this));
      }

    }, this);
  }, this);
};


// 导出
module.exports = StaticProcessor;