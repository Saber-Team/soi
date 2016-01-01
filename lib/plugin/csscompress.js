/**
 * @file css插件, 代码压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
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
    if (resource.type === 'CSS'
        && !this.ignore(resource.path)) {
      var code = resource.getContent();
      try {
        var ast = css.parse(code);
      } catch (err) {
        soi.log.error(
            'Parse Resource at [' + resource.path +
            '] error: [' + err.message +']');
        process.exit();
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
  this.options = soi.util.merge({}, defaultOptions, options);
  this.ignore = options.ignore || soi.fn.FALSE;
}

// 原型
Compressor.prototype = Object.create(proto);

module.exports = Compressor;