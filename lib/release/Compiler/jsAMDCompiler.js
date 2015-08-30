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
var constants = require('../constants');
var utils = require('../utils');
var ModuleManager = require('./manager.js');
var kerneljsDotUrl = require('../kerneljs/resolve-url');
var kerneljsRequire = require('../kerneljs/resolve-require');
var ResourceTable = require('../resource/ResourceTable');


/**
 * 根据文件列表编译代码
 * @param {Array} fileList 文件列表，内含排序的绝对路径
 * @param {Object} options 配置对象
 *                         encoding 文件编码，默认utf8
 *                         obscure 是否压缩，默认为true
 *                         replacer 对文件内容替换的操作
 * @return {String} 产出编译后的文件内容
 */
function compile (fileList, options) {
  var bigStr = '', pre = '';
  var pattern = options.replacer.from ? options.replacer.from : null,
      replacer = pattern ? options.replacer.to : null;

  fileList.forEach(function (filename) {
    var code = '';

    // 打日志
    soi.log.info('js compile file located at: ', filename);

    var mod = ModuleManager.getModuleByPath(filename);
    if (!mod) {
      soi.log.error('Module located at ', filename,
          ' has not been registered globally.');
      process.exit(1);
    } else {
      // 此处不用读文件, module中的code保存了代码
      code = mod.code;

      // 替换文本内容
      if (pattern) {
        code = code.replace(pattern, replacer);
      }

      // 解析资源定位函数
      code = kerneljsDotUrl.run(code, function (url) {
        if (soi.utils.isAbsUrl(url)) {
          return url;
        }

        // 取得资源绝对路径
        var u = soi.utils.normalizeSysPath(
          path.resolve(path.dirname(filename), url));

        // 获取资源对象
        var type = utils.resolveResourceType(u);
        var rsc = ResourceTable.getResourceByAbsolutePath(type, u);
        if (!rsc) {
          soi.log.error('Try to refer resource at: ' + u + ' failed.');
          process.exit(1);
        }

        return rsc.to;
      });

      // 解析require依赖模块
      code = kerneljsRequire.run(code, function (url) {
        if (soi.utils.isAbsUrl(url)) {
          return url
        }

        // 取得资源绝对路径
        var u = soi.utils.normalizeSysPath(
            path.resolve(path.dirname(filename), url));

        if (u.indexOf(constants.JS_FILE_EXT) === -1) {
          u += constants.JS_FILE_EXT;
        }
        // 获取模块id
        var mod = ModuleManager.getModuleByPath(u);
        if (!mod) {
          console.warn('Module with path: ' + u +
              ' have not been registered yet!');
          process.exit(1);
        }
        return mod.id;
      });
    }

    if (options.obscure) {
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
    }

    bigStr += pre + code;
    pre = '\n';
  });

  return bigStr;
}


/**
 * 根据文件列表编译文件，产出编译后的js文件内容
 * @param {Array.<String>} fileList
 * @param {Object} options 配置对象
 * @return {String}
 */
function run (fileList, options) {
  if (fileList.length <= 0) {
    return '';
  }

  return compile(fileList, options);
}


// 导出
exports.run = run;