/**
 * @file replacer插件, 监听task的`pre-compile-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
 */

var inherits = require('util').inherits;
var path = require('path');

function Replacer(options) {
  this.options = Object.create(null);
  this.extensions = options.extensions || ['HTML', 'CSS', 'JS'];
}

Replacer.prototype.init = function(task) {
  if (this.options) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  }
};

Replacer.prototype.exec = function(resource) {
  if (this.extensions.indexOf(resource.type) !== -1) {
    var content = resource.getContent();
    this.options.keys.forEach(function(reg, replacer) {
      resource.setContent(content.replace(reg, replacer));
    });
  }
};

Replacer.prototype.uninstall = function() {
  this.host.removeListener('pre-compile-resource', this.exec);
};

module.exports = Replacer;