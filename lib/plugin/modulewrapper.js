/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file 包裹common js代码.
 *       监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const os = require('os');

class CommonJSWrapper {
    constructor(options) {
        options = options || {};
        this.options = options;
        this.options.commentdoc =
            options.commentdoc ? options.commentdoc + os.EOL : '';
        this.options.define = options.define || 'define';
        this.options.entry = options.entry || 'kerneljs.exec';
        this.options.usestrict =
            options.usestrict ? '"use strict";' + os.EOL : '';
        this.ignore = options.ignore || soi.fn.FALSE;
    }

    init(task) {
        this.host = task;
        this.exec = this.exec.bind(this);
        task.on('compiled-resource', this.exec);
    }

    exec(resource) {
        if (resource.type === 'js' && !this.ignore(resource.path)) {
            if (resource.isModule) {
                let content =
                    this.options.commentdoc + this.options.define + '("' +
                    resource.id + '", function(require, exports, module) {' + os.EOL +
                    this.options.usestrict + resource.getContent() + os.EOL + '});';

                resource.setContent(content);
            }

            if (resource.isEntryPoint) {
                let content =
                    this.options.commentdoc + this.options.entry + '("' +
                    resource.id + '", function(require, exports, module) {' + os.EOL +
                    this.options.usestrict + resource.getContent() + os.EOL + '});';

                resource.setContent(content);
            }
        }
    }

    uninstall() {
        this.host.removeListener('compiled-resource', this.exec);
    }
}

module.exports = CommonJSWrapper;