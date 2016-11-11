/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file packager插件,为合并包文件加上指纹. 监听`packed`事件.
 * @author AceMood
 */

'use strict';

const node_path = require('path');
const crypto = require('crypto');

class Packager {
    constructor(options) {
        options                = options || {};
        this.options           = options;
        this.options.algorithm = options.algorithm || 'md5';
        this.options.encoding  = options.encoding || 'base64';
        this.options.length    = options.length || 9;
        this.options.noname    = !!options.noname;
        this.options.connector = options.connector || '.';
    }

    init(task) {
        this.host = task;
        this.exec = this.exec.bind(this);
        task.on('packed', this.exec);
    }

    exec() {
        let plug = this;
        let map = this.host.getMap();
        let pkgCollection = map.pkgs;

        if (pkgCollection) {
            Object.keys(pkgCollection).forEach(pkgId => {
                let pkg = pkgCollection[pkgId];
                let sum = crypto.createHash(plug.options.algorithm);
                sum.update(pkg._fileContent);

                let hash = sum.digest(plug.options.encoding)
                    .replace(/\//g, '_')
                    .substr(0, plug.options.length);

                let pkgUriObj = node_path.parse(pkg.uri);
                if (plug.options.noname) {
                    pkgUriObj.base = hash + plug.options.connector +
                        'pkg' + pkgUriObj.ext;
                } else {
                    pkgUriObj.base = hash + plug.options.connector +
                        'pkg' + plug.options.connector + pkgUriObj.base;
                }

                pkg.uri = node_path.format(pkgUriObj);
                pkg.version = hash;
            });
        }
    }

    uninstall() {
        this.host.removeListener('packed', this.exec);
    }
}

module.exports = Packager;