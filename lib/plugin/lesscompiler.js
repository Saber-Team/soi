/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 * @note todo less.render在传入callback回调时为异步执行，而且发生在
 *       task.flush之后导致文件内容没有编译。为此暂时改为覆盖扩展方法方式。
 */

var lessc = require('less');
var node_path = require('path');
var fs = require('fs');

var defaultOptions = {
  sync: true,
  async: false,
  syncImport: true,
  relativeUrls: true
};

var proto = {
  init: function(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  },
  exec: function(resource) {
    var plug = this;
    if (resource.type === 'CSS' && /\.less$/.test(resource.path)) {
      // 需要替换filename为真正编译的文件路径，否则import指令相对路径找不到
      plug.options.filename = node_path.resolve(resource.path);
      lessc.render(resource.getContent(), plug.options, function(err, output) {
        if (err) {
          soi.log.error('Parse less[' + resource.path + '] error: [' + err.message +']');
          process.exit();
        }
        resource.setContent(output.css)
      });
    }
  },
  uninstall: function() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
};

function LessCompiler(options) {
  // 合并配置对象
  options = options || Object.create(null);
  this.options = soi.util.merge({}, defaultOptions, options);
}

LessCompiler.prototype = Object.create(proto);

module.exports = LessCompiler;