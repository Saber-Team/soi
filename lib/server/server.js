/**
 * @fileoverview 经过考虑启动本地server方便前端工程师调试的功能不做成插件了,
 *   而是内置为S.O.I的子功能. 通过server命令来操作.
 *   使用方法:
 *   启动本地服务器
 *     soi server start --file conf.js
 *   叫停本地服务器
 *     soi server stop
 *
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var moveFiles = require('./moveFiles');
var routeFiles = require('./routeFiles');
var watchFiles = require('./watchFiles');

// 启动服务器实例
var server;
// 配置对象
var configObject;

/**
 * 启动本地服务器
 */
function start() {
  var conf = soi().ENV.config.server;
  var app = express();
  var cwd = process.cwd();
  var root = path.join(cwd, conf.rootDir);

  // 移动文件
  moveFiles(conf);

  // 设置服务器
  app.set('port', conf.port || 3000);
  //app.use(express.favicon());
  //app.use(logger('dev'));
  //app.use(express.bodyParser());
  app.use(express.static(root));

  // 计算请求路由
  routeFiles(conf, app);

  // 启动本地server
  server = http.createServer(app);
  server.listen(app.get('port'), function () {
    soi.log.info('Local Server started on port: ' + app.get('port'));
  });

  // 监听文件变化
  if (conf.autoWatch) {
    watchFiles.watch(root);
  }
}

/**
 * 停止本地服务器
 */
function stop() {
  var conf = soi().ENV.config.server;
  var root = path.join(cwd, conf.rootDir);

  // 取消监听文件变化
  if (conf.autoWatch) {
    watchFiles.unwatch(root);
  }

  // 停止本地server
  if (server) {
    // todo close方法在请求处理中不能正常关闭，要处理所有请求后关闭服务器
    server.close(function () {
      soi.log.info('Local Server stopped on port: ' + app.get('port'));
    });
  }
}

/**
 * 设置配置对象
 * @param {Object} obj
 */
function config(obj) {
  configObject = obj;
}


exports.start = start;
exports.stop = stop;
exports.config = config;