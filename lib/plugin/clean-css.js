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
 * @file clean-css插件, 代码压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const CleanCSS = require('clean-css');

// 默认配置
let defaultOptions = require('./clean-css.json');

class Compressor {
  constructor(options) {
    options = options || {};
    // 合并配置对象
    this.options = soi.util.merge({}, defaultOptions, options);
    this.ignore = options.ignore || soi.fn.FALSE;
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('compiled-resource', this.exec);
  }

  exec(resource) {
    if (resource.type === 'css' && !this.ignore(resource.path)) {
      let code = resource.getContent();
      let ret;
      try {
        ret = new CleanCSS().minify(code);
      } catch (err) {
        soi.log.error(
          `Parse Resource at [${resource.path}], [${err.message}]`);
        process.exit(0);
      }

      if (ret.errors.length) {
        let msg = '';
        ret.errors.forEach(err => {
          msg += err + '\n';
        });
        soi.log.error(
          `Parse Resource at [${resource.path}], ${msg}`);
        process.exit(0);
      } else {
        // minified code
        code = ret.styles;
        resource.setContent(code);
      }
    }
  }

  uninstall() {
    this.host.removeListener('compiled-resource', this.exec);
  }
}

module.exports = Compressor;