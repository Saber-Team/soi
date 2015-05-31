/**
 * @fileoverview 经过考虑启动本地server方便前端工程师调试的功能不做成插件了,
 *   而是内置为S.O.I的子功能. 通过server命令来操作.
 *   使用方法:
 *   启动本地服务器
 *     soi server start --file conf.js
 *   叫停本地服务器
 *     soi server stop
 *
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var watch = require('watch');
var mv = require('./moveFiles');

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
  //app.use(logger('dev'));
  //app.use(express.bodyParser());
  app.use(express.static(root));

  // 计算请求路由
  route(conf, app);

  // 启动本地server
  http.createServer(app).listen(app.get('port'), function () {
    soi.log.info('Local Server started on port: ' + app.get('port'));
  });

  // 监听文件变化
  if (conf.autoWatch) {
    watch.watchTree(root, watchCallback);
  }
}

/** 停止本地服务器 */
function stop () {
  var conf = soi().ENV.config.server;
  var root = path.join(cwd, conf.rootDir);

  // 取消监听文件变化
  watch.unwatchTree(root);

  // 停止本地server

}

/**
 * 检测目录文件变化
 * @param {String} f root下带路径的文件名
 * @param {fs.Stats} curr
 * @param {fs.Stats} prev
 */
function watchCallback (f, curr, prev) {

}

/**
 * 根据roadmap设置提供假数据
 * @param {Object} conf
 * @param {Express.App} app
 */
function route (conf, app) {
  var roadmap = conf.roadmap || {};
  var keys = Object.keys(roadmap);
  var reUrl;

  keys.forEach(function (pattern) {
    // 直接重定向，读取数据返回
    if (typeof pattern === 'string') {
      app.use(pattern, function (req, res) {
        var dataPath = roadmap[pattern];
        var content = soi.utils.readFile(path.join(root, dataPath), {
          encoding: 'utf8'
        });
        res.end(content);
      });
    } else if (pattern instanceof RegExp) {
      app.use(pattern, function (req, res) {
        var ret = req.originalUrl.match(pattern);
        var dataPath = roadmap[pattern].replace(reUrl, road);

        var content = soi.utils.readFile(path.join(root, dataPath), {
          encoding: 'utf8'
        });
        res.end(content);
      });

    } else if (isParamLike) {

    }


  });

  app.param('id', function (req, res, next, id) {
    console.log('CALLED ONLY ONCE');
    next();
  });
}


exports.start = start;
exports.stop = stop;