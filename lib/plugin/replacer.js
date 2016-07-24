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
 * @file replacer插件, 监听task的`pre-compile-resource`事件
 * @author AceMood
 */

'use strict';

class Replacer {
  constructor(options) {
    options      = options || {};
    this.options = options;
    this.ignore  = options.ignore || soi.fn.FALSE;
    this.ext     = options.ext || ['HTML', 'CSS', 'JS'];
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  }

  exec(resource) {
    if ((this.ext.indexOf(resource.type) !== -1) &&
      !this.ignore(resource.path)) {

      let content = resource.getContent();
      if (!this.options.reg) {
        soi.log.warn(
          'replacer plugin options should have `reg` property as an array'
        );
      }

      this.options.reg.forEach(re => {
        let reg = re[0];
        let replacer = re[1];
        resource.setContent(content.replace(reg, replacer));
      });
    }
  }

  uninstall() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
}

module.exports = Replacer;