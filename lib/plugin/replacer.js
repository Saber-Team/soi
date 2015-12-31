/**
 * @file replacer插件, 监听task的`pre-compile-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
 */

var proto = {
  init: function(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  },
  exec: function(resource) {
    if (this.ext.indexOf(resource.type) !== -1) {
      var content = resource.getContent();
      this.options.keys.forEach(function(reg, replacer) {
        resource.setContent(content.replace(reg, replacer));
      });
    }
  },
  uninstall: function() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
};

function Replacer(options) {
  this.options = options || Object.create(null);
  this.ext = options.ext || ['HTML', 'CSS', 'JS'];
}

Replacer.prototype = Object.create(proto);

module.exports = Replacer;