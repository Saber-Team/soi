/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file css插件, 代码压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const css = require('css');

// 默认css配置
let defaultOptions = {
  compress: true
};

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
      let ast;
      try {
        ast = css.parse(code);
      } catch (err) {
        soi.log.error(
          `Parse Resource at [${resource.path}], [${err.message}]`);
        process.exit(0);
      }

      code = css.stringify(ast, this.options);
      resource.setContent(code);
    }
  }

  uninstall() {
    this.host.removeListener('compiled-resource', this.exec);
  }
}

module.exports = Compressor;