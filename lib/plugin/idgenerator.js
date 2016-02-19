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
 * @file id generator插件,为资源混淆短id.
 *       监听task的`pre-compile-resource`事件.
 *       由于资源表结构的复杂性, 不能简单修改resource.id, 而应该将对应的
 *       资源依赖字段以及id为key的部分全部更新.
 * @author AceMood
 */

'use strict';

var crypto = require('crypto');

class IdGenerator {
  constructor(options) {
    options = options || {};
    this.options = options;
    this.options.algorithm = options.algorithm || 'md5';
    this.options.encoding = options.encoding || 'base64';
    this.options.length = options.length || 5;
    this.ignore = options.ignore || soi.fn.FALSE;
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  }

  exec(resource) {
    if ((resource.id === resource.path) &&
      !this.ignore(resource.path)) {
      var sum = crypto.createHash(this.options.algorithm);
      sum.update(resource.path);

      resource.id = sum.digest(this.options.encoding)
        .replace(/\//g, '_')
        .substr(0, this.options.length);
    }
  }

  uninstall() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
}

module.exports = IdGenerator;