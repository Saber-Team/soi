/**
 * @file uglifier插件, js压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
 * @note soi.util.merge一些功能函数的实现
 */

var css = require('css');

// 默认css配置
var defaultOptions = {
  compress: true
};

var proto = {
  init: function(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('compiled-resource', this.exec);
  },
  exec: function(resource) {
    if (resource.type === 'CSS') {
      var code = resource.getContent();
      try {
        var ast = css.parse(code);
      } catch (e) {
        debugger
      }

      // stylesheet is the root node returned by css.parse.
      code = css.stringify(ast, this.options);
      resource.setContent(code);
    }
  },
  uninstall: function() {
    this.host.removeListener('compiled-resource', this.exec);
  }
};

function Compressor(options) {
  options = options || Object.create(null);
  // 合并配置对象
  this.options = soi.util.merge(Object.create(null), defaultOptions, options);
}

// 原型
Compressor.prototype = Object.create(proto);

module.exports = Compressor;