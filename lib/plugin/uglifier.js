/**
 * @file uglifier插件, js压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 * @email zmike86@gmail.com
 */

var UglifyJS = require('uglify-js');

// 默认uglify配置
var defaultOptions = require('./uglifier.json');

var proto = {
  init: function(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('compiled-resource', this.exec);
  },
  exec: function(resource) {
    if ((resource.type === 'JS')
        && !this.ignore(resource.path)) {
      var code = resource.getContent();
      var ast = UglifyJS.parse(code);

      // compressor needs figure_out_scope too
      ast.figure_out_scope();
      var compressor = UglifyJS.Compressor(this.options);
      ast = ast.transform(compressor);

      // need to figure out scope again so mangler works optimally
      ast.figure_out_scope();
      ast.compute_char_frequency();
      ast.mangle_names();

      // get Ugly code back :)
      // get compressed code
      code = ast.print_to_string();
      resource.setContent(code);
    }
  },
  uninstall: function() {
    this.host.removeListener('compiled-resource', this.exec);
  }
};

function Uglifier(options) {
  options = options || Object.create(null);
  // 合并配置对象
  this.options = soi.util.merge({}, defaultOptions, options);
  this.ignore = options.ignore || soi.fn.FALSE;
}

Uglifier.prototype = Object.create(proto);

module.exports = Uglifier;