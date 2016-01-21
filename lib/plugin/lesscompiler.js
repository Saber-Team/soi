/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */

'use strict';

var lessc = require('less');
var node_path = require('path');
var fs = require('fs');

var defaultOptions = {
  sync: true,
  async: false,
  syncImport: true,
  relativeUrls: true
};

class LessCompiler {
  constructor(options) {
    options = options || {};
    this.options = soi.util.merge({}, defaultOptions, options);
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  }

  exec(resource) {
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
  }

  uninstall() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
}

module.exports = LessCompiler;