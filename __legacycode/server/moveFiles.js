/**
 * @fileoverview 启动服务器前提供移动文件功能
 * @author zmike86
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var rimraf = require('rimraf');
var glob = require('glob');

/**
 * 根据soi.config.server的配置节点, 生成web根目录
 * 并copy文件到根目录(可选)
 * @param {Object} conf conf含有files数组, 每个数组项含有from to指明移动路径
 */
module.exports = function move (conf) {
  if (conf.rootDir === '.' ||
      conf.rootDir === '/' ||
      conf.rootDir === './') {
    return;
  }

  var cwd = process.cwd();
  var root = path.join(cwd, conf.rootDir);

  // 删除目录
  rimraf.sync(root);

  // 新建目录
  soi.fs.mkdir(root);

  // 复制文件
  if (conf.files) {
    conf.files.forEach(function (item) {
      var from = typeof item.from == 'function' ? item.from() : item.from,
          to = typeof item.to == 'function' ? item.to() : item.to;
      // options is optional
      // files is an array of filenames.
      // If the `nonull` option is set, and nothing
      // was found, then files is ["**/*.js"]
      // er is an error object or null.
      var files = glob.sync(from);
      files.forEach(function (file) {
        var distDir = path.join(root, to);
        soi.fs.mkdir(distDir);
        // 读写文件, 相当于复制
        var content = soi.fs.readFile(file, { encoding: 'utf8' });
        soi.fs.writeFile(path.join(distDir, path.basename(file)),
            content,
            {
              encoding: 'utf8'
            });
      });
    });
  }
};