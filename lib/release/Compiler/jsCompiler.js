'use strict';

// import modules
var path = require('path');
var fs = require('fs');
var UglifyJS = require('uglify-js');
var uglifyOptions = require('./uglifyOptions');


var utils = require('../utils');
var ModuleManager = require('./manager.js');


/**
 * 根据文件列表编译代码
 * @param {Array} fileList 文件列表，内含排序的绝对路径
 * @param {String} encoding 文件编码，默认utf8
 * @return {String} 产出编译后的文件内容
 */
function compile(fileList, encoding) {
  var bigStr = '', pre = '';

  fileList.forEach(function(filename) {
    // 打日志
    soi.log.info('js compile file located at: ', filename);

    var mod = ModuleManager.getModuleByPath(filename);
    if (!mod) {
      soi.log.error('Module located at ', filename,
          ' has not been registered globally.');
      process.exit(1);
    }
    var code = mod.code;

    // 此处不用读文件, module中的code保存了代码
    // var content = soi.fs.readFile(filename, { encoding: encoding });
    var ast = UglifyJS.parse(code);

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
    code = ast.print_to_string();

    bigStr += pre + code;
    pre = '\n';
  });

  /*
  var ast = UglifyJS.parse(bigStr);
  ast.figure_out_scope();
  var compressor = UglifyJS.Compressor(uglifyOptions);
  ast = ast.transform(compressor);
  // need to figure out scope again so mangler works optimally
  ast.figure_out_scope();
  ast.compute_char_frequency();
  ast.mangle_names();
  bigStr = ast.print_to_string();*/

  return bigStr;
}


/**
 * 根据文件列表编译文件，产出编译后的js文件内容
 * @param {Array.<String>} fileList
 */
function run(fileList) {
  if (fileList.length <= 0)
    return;

  var content = compile(fileList, 'utf8');

  // debugger;

  return content;
}


// 导出
exports.run = run;