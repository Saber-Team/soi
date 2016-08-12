/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB, AceMood
 */

'use strict';

const lessc     = require('less');
const node_path = require('path');
const fs        = require('fs');

let defaultOptions = {
  sync: true,
  async: false,
  syncImport: true,
  relativeUrls: true
};
let options = Object.assign({}, defaultOptions);
let ignore = soi.fn.FALSE;
let path;

/**
 * config processor
 * @param {?object} opt
 */
const config = function(opt) {
  opt     = opt || {};
  options = soi.util.merge(options, opt);
  ignore  = options.ignore || soi.fn.FALSE;
};

/**
 * filter proper resource
 * @param {CSS} css
 * @returns {boolean}
 */
const filter = function(css) {
  path = css.path;
  return /\.less$/.test(css.path) && !ignore(css.path)
};

/**
 * compile css source code
 * @param {string} sourceCode
 * @returns {*}
 */
const execute = function(sourceCode) {
  // 需要替换filename为真正编译的文件路径，否则import指令相对路径找不到
  options.filename = node_path.resolve(path);
  let css;
  if (!sourceCode) {
    return '';
  }
  lessc.render(sourceCode, options, (err, output) => {
    if (err) {
      soi.log.error(
        `Less plugin parse file [${path}], [${err.message}]`
      );
      process.exit(0);
    }
    css = output.css || '[Parse error]';
  });
  return css;
};

exports.config = config;
exports.filter = filter;
exports.execute = execute;