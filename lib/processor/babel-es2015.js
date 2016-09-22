/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file babel-es2016预处理器编译成es5, 后续由js插件处理.
 * @author AceMood
 */

'use strict';

const babel = require('babel-core');
// 直接通过配置加载presets模块会有路径上的bug， 具体看这个
// #https://phabricator.babeljs.io/T6692
// 代码调用的时候解决方案就是如此
const preset_es2015 = require('babel-preset-es2015');

let defaultOptions = {
    presets: [
        preset_es2015
    ],
    comments: true,
    moduleIds: false
};

/**
 * compile js source code
 * @param {JS} js
 * @param {?object=} opt
 * @returns {*}
 */
const processor = function(js, opt) {
    let sourceCode = js.getContent();
    let path = js.path;
    if (!sourceCode) {
        return sourceCode;
    }

    opt = opt || {};
    let options = soi.util.merge({}, defaultOptions, opt);
    let ignore = options.ignore || soi.fn.FALSE;
    let ret;

    if (!ignore(js.path)) {
        try {
            ret = babel.transform(sourceCode, options);
        } catch (err) {
            soi.log.error(
                `Babel-es2015 parse file [${path}], [${err.message}]`
            );
            process.exit(0);
        }

        js.setContent(ret.code);
        return ret.code;
    }

    return sourceCode;
};

module.exports = processor;