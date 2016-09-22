/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file less预处理器编译成css文件, 后续由css插件处理.
 * @author XCB, AceMood
 */

'use strict';

const lessc     = require('less');
const node_path = require('path');

let defaultOptions = {
    sync: true,
    async: false,
    syncImport: true,
    relativeUrls: true
};

/**
 * compile css source code
 * @param {CSS} css
 * @param {?object=} opt
 * @returns {*}
 */
const processor = function(css, opt) {
    let sourceCode = css.getContent();
    let path = css.path;
    if (!sourceCode) {
        return sourceCode;
    }

    opt = opt || {};
    let options = soi.util.merge({}, defaultOptions, opt);
    let ignore = options.ignore || soi.fn.FALSE;
    let ret;

    if (/\.less$/.test(css.path) && !ignore(css.path)) {
        // 需要替换filename为真正编译的文件路径，否则import指令相对路径找不到
        options.filename = node_path.resolve(path);
        lessc.render(sourceCode, options, (err, output) => {
            if (err) {
                soi.log.error(
                    `Less plugin parse file [${path}], [${err.message}]`
                );
                process.exit(0);
            }
            ret = output.css || '[Parse error]';
        });

        css.setContent(ret);
        return ret;
    }

    return sourceCode;
};

module.exports = processor;