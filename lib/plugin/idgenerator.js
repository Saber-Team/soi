/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file id generator插件,为资源混淆短id.
 *       AOP方式插入task的`preProcess`前面.
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
        this.ext               = options.ext || ['image', 'js', 'css'];
    }

    init(task) {
        this.host = task;
        this.exec = this.exec.bind(this);
        this.backUp = this.host.preProcess;
        task.onBeforeMethod('preProcess', this.exec);
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
                    let r = map.resourceMap.css[id];
                    return r.sid || r.id;
                });
            }

            if (resource.requiredModules) {
                resource.requiredModules = resource.requiredModules.map(id => {
                    let r = map.resourceMap.js[id];
                    return r.sid || r.id;
                });
            }

            if (resource.requiredAsyncModules) {
                resource.requiredAsyncModules = resource.requiredAsyncModules.map(id => {
                    let r = map.resourceMap.js[id];
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
        this.host.preProcess = this.backUp;
    }
}

module.exports = IdGenerator;