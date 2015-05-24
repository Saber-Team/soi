/**
 * @fileoverview
 * @author
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var rimraf = require('rimraf');
var glob = require('glob');

/**
 * 根据soi.config.server的配置节点, 生成web根目录并copy文件到根目录
 * @param {Object} conf
 */
module.exports = function move (conf) {
    var cwd = process.cwd();
    var root = path.join(cwd, conf.rootDir);
    // 删除目录
    rimraf.sync(root);
    // 新建目录
    soi.utils.mkdir(root);

    // 复制文件
    conf.files.forEach(function (item) {
        var from = typeof item.from == 'function' ? item.from() : item.from,
            to = typeof item.to == 'function' ? item.to() : item.to;
        // options is optional
        var files = glob.sync(from);
        files.forEach(function (file) {
            var distDir = path.join(root, to);
            soi.utils.mkdir(distDir);
            var content = soi.utils.readFile(file, {
                encoding: 'utf8'
            });
            soi.utils.writeFile(path.join(distDir, path.basename(file)), content, {
                encoding: 'utf8'
            });
        });
        // files is an array of filenames.
        // If the `nonull` option is set, and nothing
        // was found, then files is ["**/*.js"]
        // er is an error object or null.
    });
};