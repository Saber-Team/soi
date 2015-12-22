/**
 * @file hash/md5插件, 覆盖`resolveProductUriInternal`方法
 * @author AceMood
 * @email zmike86@gmail.com
 * @note 用到的path.format|path.parse方法在node v0.10.x不支持.
 */

var inherits = require('util').inherits;
var path = require('path');
var crypto = require('crypto');

function HashPlugin(options) {
  this.options = Object.create(null);
  this.options.algorithm = options.algorithm || 'md5';
  this.options.encoding = options.encoding || 'base64';
  this.options.length = options.length || 9;
  this.options.noname = !!options.noname;
  this.options.connector = options.connector || '.';
}

HashPlugin.prototype.init = function(task) {
  this.host = task;
  this._reservedMethod = task.resolveProductUriInternal;
  task.resolveProductUriInternal = this.exec;
};

HashPlugin.prototype.exec = function() {
  var sum = crypto.createHash(this.options.algorithm);
  sum.update(resource.getContent());
  var hash = sum.digest(this.options.encoding)
      .replace(/\//g, '_')
      .substr(0, this.options.length);

  // https://nodejs.org/docs/latest-v0.12.x/api/path.html#path_path_parse_pathstring
  var pathObj = path.parse(resource.uri);
  if (this.options.noname) {
    pathObj.base = hash + pathObj.ext;
  } else {
    pathObj.base = hash + this.options.connector + pathObj.base;
  }
  resource.uri = path.format(pathObj);
};

HashPlugin.prototype.uninstall = function() {
  this.host.resolveProductUriInternal = this._reservedMethod;
  delete this._reservedMethod;
};

module.exports = HashPlugin;