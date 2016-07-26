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
 * @file hash/md5插件,为文件名加上指纹.
 *       监听`resolved-resource`事件.
 * @author AceMood
 * @note 用到的path.format|path.parse方法在node v0.10.x不支持.
 */

'use strict';

const node_path = require('path');
const crypto = require('crypto');

class Fingerprint {
  constructor(options) {
    options                = options || {};
    this.options           = options;
    this.options.algorithm = options.algorithm || 'md5';
    this.options.encoding  = options.encoding || 'base64';
    this.options.length    = options.length || 9;
    this.options.noname    = !!options.noname;
    this.options.connector = options.connector || '.';
    this.ignore            = options.ignore || soi.fn.FALSE;
    this.ext               = options.ext || ['image', 'js', 'css'];
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('resolved-resource', this.exec);
  }

  exec(resource) {
    if ((this.ext.indexOf(resource.type) !== -1)
      && !this.ignore(resource.path)) {

      let sum = crypto.createHash(this.options.algorithm);
      sum.update(resource.getContent());

      let hash = sum.digest(this.options.encoding)
        .replace(/\//g, '_')
        .substr(0, this.options.length);

      // https://nodejs.org/docs/latest-v0.12.x/api/path.html#path_path_parse_pathstring
      let pathObj = node_path.parse(resource.uri);
      if (this.options.noname) {
        pathObj.base = hash + pathObj.ext;
      } else {
        pathObj.base = hash + this.options.connector + pathObj.base;
      }
      resource.uri = node_path.format(pathObj);
    }
  }

  uninstall() {
    this.host.removeListener('resolved-resource', this.exec);
  }
}

module.exports = Fingerprint;