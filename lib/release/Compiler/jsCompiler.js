/**
 * @fileoverview 对amd模块化的js代码进行压缩合并
 * @author AceMood
 * @email zmike86@gmail.com
 */


'use strict';


// import modules
var path = require('path');
var fs = require('fs');
var UglifyJS = require('uglify-js');
var uglifyOptions = require('./uglifyOptions');


var utils = require('../utils');


/**
 * 根据文件列表编译代码
 * @param {Array} fileList 文件列表，内含排序的绝对路径
 * @param {Object} options 配置对象
 *                         encoding 文件编码，默认utf8
 *                         obscure 是否压缩，默认为true
 * @return {String} 产出编译后的文件内容
 */
function compile(fileList, options) {
  var bigStr = '', pre = '';

  fileList.forEach(function(filename) {
    // 打日志
    soi.log.info('js compile file located at: ', filename);

    // 读文件
    var code = soi.fs.readFile(filename, {
      encoding: options.encoding
    });

    bigStr += pre + code;
    pre = '\n';
  });

  if (options.obscure) {
    var ast = UglifyJS.parse(bigStr);

    // compressor needs figure_out_scope too
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor(uglifyOptions);
    ast = ast.transform(compressor);

    // need to figure out scope again so mangler works optimally
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();

    // get Ugly code back :)
    // get compressed code
    bigStr = ast.print_to_string();
  }

  return bigStr;
}


/**
 * 根据文件列表编译文件，产出编译后的js文件内容
 * @param {Array.<String>} fileList
 * @param {Object} options 配置对象
 * @return {String}
 */
function run(fileList, options) {
  if (fileList.length <= 0) {
    return '';
  }

  return compile(fileList, options);
}


// 导出
exports.run = run;