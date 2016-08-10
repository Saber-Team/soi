/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB, AceMood
 */

'use strict';

const lessc     = require('less');
const node_path = require('path');
const fs        = require('fs');

let defaultOptions = {
  sync: true,
  async: false,
  syncImport: true,
  relativeUrls: true
};

class LessCompiler {
  constructor(options) {
    options      = options || {};
    this.options = soi.util.merge({}, defaultOptions, options);
    this.ignore  = options.ignore || soi.fn.FALSE;
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
  }

  exec(resource) {
    let plug = this;
    if (resource.type === 'css'
        && /\.less$/.test(resource.path)
        && !this.ignore(resource.path)) {

      // 需要替换filename为真正编译的文件路径，否则import指令相对路径找不到
      plug.options.filename = node_path.resolve(resource.path);
      lessc.render(resource.getContent(), plug.options, (err, output) => {
        if (err) {
          soi.log.error(`Parse file [${resource.path}], [${err.message}]`);
          process.exit();
        }

        resource.setContent(output.css);
      });
    }
  }

  uninstall() {
    this.host.removeListener('pre-compile-resource', this.exec);
  }
}

module.exports = LessCompiler;