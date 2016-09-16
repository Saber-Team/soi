/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file 包裹使用modux作为模块加载器的amd js代码.
 *       监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const os = require('os');

function buildDependencyArguments(dependencies) {
    let deps = [];
    dependencies.forEach(dependency => {
        deps.push('"' + dependency + '"');
    });
    return deps.join(',');
}

class CommonJSWrapper {
    constructor(options) {
        options = options || {};
        this.options = options;
        this.options.commentdoc =
            options.commentdoc ? options.commentdoc + os.EOL : '';
        this.options.define = options.define || '__d';
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
                    resource.id + '", [' + buildDependencyArguments(resource.requiredModules) +
                    '], function(global, require, module, exports) {' + os.EOL +
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