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
 * @file packager插件,为合并包文件加上指纹. 监听`packed`事件.
 * @author AceMood
 */

'use strict';

var node_path = require('path');
var crypto = require('crypto');

class Packager {
  constructor(options) {
    options = options || {};
    this.options = options;
    this.options.algorithm = options.algorithm || 'md5';
    this.options.encoding = options.encoding || 'base64';
    this.options.length = options.length || 9;
    this.options.noname = !!options.noname;
    this.options.connector = options.connector || '.';
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('packed', this.exec);
  }

  exec() {
    var plug = this;
    var map = this.host.getMap();
    var pkgCollection = map.pkgs;

    if (pkgCollection) {
      Object.keys(pkgCollection).forEach(pkgId => {
        var pkg = pkgCollection[pkgId];
        var sum = crypto.createHash(plug.options.algorithm);
        sum.update(pkg._fileContent);

        var hash = sum.digest(plug.options.encoding)
          .replace(/\//g, '_')
          .substr(0, plug.options.length);

        var pkgUriObj = node_path.parse(pkg.uri);
        if (plug.options.noname) {
          pkgUriObj.base = hash + plug.options.connector +
            'pkg' + pkgUriObj.ext;
        } else {
          pkgUriObj.base = hash + plug.options.connector +
            'pkg' + plug.options.connector + pkgUriObj.base;
        }

        pkg.uri = node_path.format(pkgUriObj);
      });
    }
  }

  uninstall() {
    this.host.removeListener('packed', this.exec);
  }
}

module.exports = Packager;