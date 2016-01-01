/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */

'use strict';

var lessc = require('less');
var node_path = require('path');
var fs = require('fs');

var defaultOptions = {
  sync : true,
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
          soi.log.error('Render less[' + resource.path + '] error: [' + err.message +']');
          process.exit();
        }
        var result = output.css || ' '; //写几个空值,这样fileContent就不为空了,哈哈
        resource.setContent(result);
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