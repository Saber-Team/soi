/**
 * @fileoverview 经过考虑启动本地server方便前端工程师调试的功能不做成插件了,
 *   而是内置为S.O.I的子功能. 通过server命令来操作.
 *   使用方法:
 *   启动本地服务器
 *     soi server --start --file conf.js
 *     或
 *     soi server -s -f conf.js
 *   叫停本地服务器
 *     soi server --stop
 *     或
 *     soi server -x
 *
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var mv = require('./move');
var ajax = require('./routeAjax');

/** 启动本地服务器 */
function start () {
    var conf = soi().ENV.config.server;
    var app = express();
    var cwd = process.cwd();
    var root = path.join(cwd, conf.rootDir);

    // 移动文件
    mv(conf);

    // 设置服务器
    app.set('port', conf.port || 3000);
    //app.use(express.favicon());
    //app.use(express.logger('dev'));
    //app.use(express.bodyParser());
    app.use(express.static(root));

    // 计算请求路由 todo
    var map = ajax(conf);
    var keys = Object.keys(map);
    keys.forEach(function (url) {
        app.get(url, function (req, res, next) {
            debugger;
            res.end('Hello World!');
        });
    });

    // 启动
    http.createServer(app).listen(app.get('port'), function () {
       soi.log.info('Local Server started at port: ' + app.get('port'));
    });
}

/** 停止本地服务器 */
function stop () {
    var conf = soi().ENV.config.server;

}


exports.start = start;
exports.stop = stop;