/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
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
    this.ext     = options.ext || ['html', 'css', 'js'];
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