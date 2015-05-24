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
var glob = require('glob');
var express = require('express');
var mv = require('./move');

/** 启动本地服务器 */
function start () {
    var conf = soi().ENV.config.server;
    var app = express();
    var cwd = process.cwd();
    var root = path.join(cwd, conf.rootDir);

    // 移动文件
    mv(conf);

    // 设置根路径
    express.static(root);

    app.get('/', function (req, res) {
        debugger;
        res.end('Hello World!');
    });

    // 启动
    app.listen(conf.port || 3000);
}

/** 停止本地服务器 */
function stop () {
    var conf = soi().ENV.config.server;

}


exports.start = start;
exports.stop = stop;