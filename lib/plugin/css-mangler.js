/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file css类名混淆插件, 在编译资源之前处理
 * @author AceMood
 */

'use strict';

const css = require('css');
const tail = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
let cl = [];
let cIdx = 0;

// 默认css配置
let defaultOptions = {
  // 类名的间隔符
  separator: '-',
  // 可混淆的类名最多为500个
  maxLength: 500
};

class Mangler {
  constructor(options) {
    options = options || {};
    // 合并配置对象
    this.options = soi.util.merge({}, defaultOptions, options);
    this.ignore = options.ignore || soi.fn.FALSE;
    this._initialize();
  }

  _initialize() {
    let len = tail.length;
    cl = tail.split('');
    if (len > this.options.maxLength) {
      cl.length = len;
    } else {
      // let n = Math.ceil(this.options.maxLength / len) - 1;
      for (let i = 0; i < len; ++i) {
        for (let j = 0; j < len; ++j) {
          cl.push(cl[i] + cl[j]);
        }
      }
    }
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    this.backUp = this.host.preProcess;
    task.onBeforeMethod('preProcess', this.exec);
  }

  mangle(selector) {
    let map = this.host.getMap();
    map.cssClassMap = map.cssClassMap ? map.cssClassMap : {};
    selector = selector.replace(/^\./, '');
    let sep = this.options.separator;
    let parts = selector.split(sep);
    let maxLength = this.options.maxLength;
    let comp = parts.map(word => {
      if (map.cssClassMap[word]) {
        return map.cssClassMap[word];
      }
      if (cIdx === maxLength) {
        return word;
      }
      map.cssClassMap[word] = cl[cIdx++];
      return map.cssClassMap[word];
    });
    return '.' + comp.join(sep);
  }

  exec() {
    let map = this.host.getMap();
    map.getAllResources()
      .filter(resource => resource.type === 'css' && !this.ignore(resource.path))
      .forEach(resource => {
        let code = resource.getContent();
        let ast;
        try {
          ast = css.parse(code);
        } catch (err) {
          soi.log.error(
            `Parse Resource at [${resource.path}], [${err.message}]`);
          process.exit(0);
        }

        // stylesheet is the root node returned by #css.parse
        if (ast.stylesheet) {
          ast.stylesheet.rules
            .filter(rule => rule.type === 'rule')
            .forEach(rule => {
              rule.selectors = rule.selectors
                .map(selector => {
                  if (selector.charAt(0) === '.') {
                    return this.mangle(selector);
                  }
                  return selector;
                });
            });
        }
        code = css.stringify(ast, this.options);
        resource.setContent(code);
      });
  }

  uninstall() {
    this.host.preProcess = this.backUp;
  }
}

module.exports = Mangler;