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

function Compressor(options) {
  options = options || Object.create(null);
  // 合并配置对象
  this.options = soi.util.merge(Object.create(null), defaultOptions, options);
}

Compressor.prototype.init = function(task) {
  this.host = task;
  this.exec = this.exec.bind(this);
  task.on('compiled-resource', this.exec);
};

Compressor.prototype.exec = function(resource) {
  if (resource.type === 'CSS') {
    var code = resource.getContent();
    var ast = css.parse(code);

    // stylesheet is the root node returned by css.parse.
    code = css.stringify(ast, this.options);
    resource.setContent(code);
  }
};

Compressor.prototype.uninstall = function() {
  this.host.removeListener('compiled-resource', this.exec);
};

module.exports = Compressor;