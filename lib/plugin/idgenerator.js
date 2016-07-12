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

const crypto = require('crypto');

class IdGenerator {
  constructor(options) {
    options                = options || {};
    this.options           = options;
    this.options.algorithm = options.algorithm || 'md5';
    this.options.encoding  = options.encoding || 'base64';
    this.options.length    = options.length || 5;
    this.ignore            = options.ignore || soi.fn.FALSE;
    this.ext               = options.ext || ['Image', 'JS', 'CSS'];
  }

  init(task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.onBeforeMethod('compile', this.exec);
    //task.on('beforeCompiled', this.exec);
  }

  exec() {
    let plug = this;
    let map = this.host.getMap();

    map.getAllResources().forEach(resource => {
      if ((plug.ext.indexOf(resource.type) !== -1) &&
        (resource.id === resource.path) &&
        !plug.ignore(resource.path)) {
        let sum = crypto.createHash(plug.options.algorithm);
        sum.update(resource.path);

        // 生成短id
        resource.sid = sum.digest(plug.options.encoding)
          .replace(/\//g, '_')
          .substr(0, plug.options.length);

        // 修正map.resourceMap
        map.resourceMap[resource.type][resource.sid] = resource;
      }
    });

    // 修正依赖id
    map.getAllResources().forEach(resource => {
      if (resource.requiredCSS) {
        resource.requiredCSS = resource.requiredCSS.map(id => {
          let r = map.resourceMap.CSS[id];
          return r.sid || r.id;
        });
      }

      if (resource.requiredModules) {
        resource.requiredModules = resource.requiredModules.map(id => {
          let r = map.resourceMap.JS[id];
          return r.sid || r.id;
        });
      }

      if (resource.requiredAsyncModules) {
        resource.requiredAsyncModules = resource.requiredAsyncModules.map(id => {
          let r = map.resourceMap.JS[id];
          return r.sid || r.id;
        });
      }
    });

    map.getAllResources().forEach(resource => {
      if ((plug.ext.indexOf(resource.type) !== -1) && resource.sid) {
        resource.id = resource.sid;
        delete resource.sid;
        delete map.resourceMap[resource.type][resource.path];
      }
    });
  }

  uninstall() {
    //this.host.removeListener('pre-compile-resource', this.exec);
  }
}

module.exports = IdGenerator;