'use strict';

// import modules
var path = require('path');
var fs = require('fs');
var css = require('css');

var utils = require('../utils');
var ResourceTable = require('../resource/table');
var res = require('./cssUrlRegExps');


/**
 * 根据文件列表编译代码
 * @param {Array} fileList 文件列表，内含排序的绝对路径
 * @param {String} encoding 文件编码，默认utf8
 * @return {String} 产出编译后的文件内容
 */
function compile(fileList, encoding) {
  var bigStr = '';

  fileList.forEach(function(filename) {
    // 打日志
    soi.log.info('css compile file located at: ', filename);

    // 读文件
    var content = soi.fs.readFile(filename, { encoding: encoding });
    var ast = css.parse(content);

    // stylesheet is the root node returned by css.parse.
    if (ast.stylesheet && ast.stylesheet.rules) {
      var deps = [];
      for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
        var rule = ast.stylesheet.rules[i];

        // 去掉import指令
        if (rule.type === 'import') {
          ast.stylesheet.rules.splice(i, 1);
          i--;
        }
        // web font
        else if (rule.type === 'font-face') {
          rule.declarations.forEach(function(declaration) {
            var ret;
            if (declaration.property === 'src') {

              // 资源位置
              ret = res.getWebFonts(declaration.value);
              ret.forEach(function(url) {
                // 只处理相对路径
                if (soi.utils.isAbsUrl(url)) {
                  return;
                }

                // 取得资源绝对路径
                var u = soi.utils.normalizeSysPath(
                    path.resolve(path.dirname(filename), url));

                // 获取资源对象
                var rsc = ResourceTable.getResourceByAbsolutePath('font', u);
                if (!rsc) {
                  soi.log.error('Try to refer font at: ' + u + ' failed.');
                  process.exit(1);
                }

                // 替换
                declaration.value = declaration.value.replace(url, rsc.to);
              });
            }
          });
        }
        // 替换带有资源定位的属性
        else if (rule.type === 'rule') {
          rule.declarations.forEach(function(declaration) {
            var ret;
            // todo modify declaration.position.end.column
            // url("../img/a.png") no-repeat;
            // border-image:url(../img/a.png) 30 30 round;
            if (res.BACKGROUND_IMAGE.test(declaration.property) ||
                res.BORDER_IMAGE.test(declaration.property)) {

              // 资源位置
              ret = res.getBgImages(declaration.value);
              ret.forEach(function(url) {
                // 只处理相对路径
                if (soi.utils.isAbsUrl(url)) {
                  return;
                }

                // 取得资源绝对路径
                var u = soi.utils.normalizeSysPath(
                    path.resolve(path.dirname(filename), url));

                // 获取资源对象
                var rsc = ResourceTable.getResourceByAbsolutePath('img', u);
                if (!rsc) {
                  soi.log.error('Try to refer image at: ' + u + ' failed.');
                  process.exit(1);
                }

                // 替换
                declaration.value = declaration.value.replace(url, rsc.to);
              });
            }
            /*
             // htc file refer
             if (res.BEHAVIOR.test(declaration.property)) {
             ret = res.getHTCs(declaration.value);
             if (ret.length) {
             ret.forEach(function(url) {
             // only deal with top-level path and relative path
             if (utils.isAbsUrl(url)) {
             return;
             }
             var u = utils.normalizeSysPath(
             path.resolve(path.dirname(startPath), url));
             // get the final path
             var p = ResourceTable.getResource('htc', u).distPath;
             // calc the relative path to dist combo file
             var f = utils.normalizeSysPath(
             path.relative(path.dirname(
             currentPkg.dist_dir + '/' + currentPkg.dist_file), p));

             declaration.value = declaration.value.replace(url, f);
             });
             }
             }

             // 禁用滤镜
             if (res.FILTER.test(declaration.property)) {
             ret = res.getFilters(declaration.value);
             if (ret.length) {
             ret.forEach(function(url) {
             // only deal with top-level path and relative path
             if (utils.isAbsUrl(url)) {
             return;
             }
             // relative from app.html
             var u = utils.normalizeSysPath(
             path.resolve(soi().ENV.config.optimizer.output_base, url));
             // get the final path
             var p = ResourceTable.getResource('img', u).distPath;
             // calc the relative path to dist combo file
             var f = utils.normalizeSysPath(
             path.relative(soi().ENV.config.optimizer.output_base
             + '/', p));

             declaration.value = declaration.value.replace(url, f);
             });
             }
             }*/
          });
        }
      }

      bigStr += css.stringify(ast, { compress: true });
    }
  });

  return bigStr;
}


/**
 * 根据文件列表编译文件，产出编译后的css文件内容
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