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
 * @file uglifier插件, js压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const UglifyJS = require('uglify-js');

// default uglify config
let defaultOptions = require('./uglifier.json');

class Uglifier {
  constructor(options) {
    options      = options || {};
    this.options = soi.util.merge({}, defaultOptions, options);
    this.ignore  = options.ignore || soi.fn.FALSE;
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('compiled-resource', this.exec);
  }

  exec(resource) {
    // 跳过permanent的资源
    if ((resource.type === 'JS')
        && !this.ignore(resource.path)
        && !resource.isPermanent) {

      let code = resource.getContent();
      let ast = UglifyJS.parse(code);

      // compressor needs figure_out_scope too
      ast.figure_out_scope();
      let compressor = UglifyJS.Compressor(this.options);
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
  }

  uninstall() {
    this.host.removeListener('compiled-resource', this.exec);
  }
}

module.exports = Uglifier;