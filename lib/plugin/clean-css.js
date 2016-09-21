/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file clean-css插件, 代码压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const CleanCSS = require('clean-css');

// 默认配置
let defaultOptions = require('./clean-css.json');

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
            let ret;
            try {
                ret = new CleanCSS(this.options).minify(code);
            } catch (err) {
                soi.log.error(
                    `Parse Resource at [${resource.path}], [${err.message}]`);
                process.exit(0);
            }

            if (ret.errors.length) {
                let msg = '';
                ret.errors.forEach(err => {
                    msg += err + '\n';
                });
                soi.log.error(`Parse Resource at [${resource.path}], ${msg}`);
                process.exit(0);
            } else {
                // minified code
                code = ret.styles;
                resource.setContent(code);
            }
        }
    }

    uninstall() {
        this.host.removeListener('compiled-resource', this.exec);
    }
}

module.exports = Compressor;