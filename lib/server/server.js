/**
 * @fileoverview 经过考虑启动本地server方便前端工程师调试的功能不做成插件了,
 *   而是内置为S.O.I的子功能. 通过server命令来操作.
 *   使用方法:
 *   # 启动本地服务器
 *     soi server --start --file conf.js
 *     或
 *     soi server -s -f conf.js
 *   # 叫停本地服务器
 *     soi server --stop
 *     或
 *     soi server -x
 *
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var glob = require('glob');
var express = require('express');

function start () {
    var conf = soi().ENV.config.server;
    var app = express();
    copy2files(conf);
    app.get('/', function (req, res) {
        debugger;
    });
    app.listen(conf.port || 3000);
}

function stop () {
    var conf = soi().ENV.config.server;

}

/**
 * 根据soi.config.server的配置节点, 生成web根目录并copy文件到根目录
 * @param {Object} conf
 */
function copy2files (conf) {
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
}

exports.start = start;
exports.stop = stop;