/**
 * @file id generator插件,为资源混淆短id. 监听task的`pre-compile-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
 */

var path = require('path');
var crypto = require('crypto');

function IdGenerator(options) {
  options = options || Object.create(null);
  this.options.algorithm = options.algorithm || 'md5';
  this.options.encoding = options.encoding || 'base64';
  this.options.length = options.length || 5;
}

IdGenerator.prototype.init = function(task) {
  this.host = task;
  this.exec = this.exec.bind(this);
  task.on('pre-compile-resource', this.exec);
};

IdGenerator.prototype.exec = function(resource) {
  if (resource.id === resource.path) {
    var sum = crypto.createHash(this.options.algorithm);
    sum.update(resource.path);
    resource.id = sum.digest(this.options.encoding)
        .replace(/\//g, '_')
        .substr(0, this.options.length);
  }
};

IdGenerator.prototype.uninstall = function() {
  this.host.removeListener('pre-compile-resource', this.exec);
};

module.exports = IdGenerator;