/**
 * @fileoverview 发送数据流到服务器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var http = require('http');
var url = require('url');
var glob = require('glob');
var path = require('path');

// 配置对象
var configObject;

/**
 * 取得request需要的各部分
 * @param {Object} configObject
 * @returns {Object}
 */
function parseConf (configObject) {
  var ret = url.parse(configObject.receiver);
  return {
    hostname: ret.hostname,
    port: ret.port,
    path: ret.path
  }
}

/**
 *
 * @param {http.ServerResponse} res
 */
function transferCallBack (res) {
  //console.log('STATUS: ' + res.statusCode);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    //console.log('BODY: ' + chunk);
  });
}

/**
 * 传输错误时回调
 * @param {Event} e
 */
function errorCallBack (e) {
    soi.log.warn('Failed request: ' + e.message);
}

/**
 * 部署文件
 * @param {String} task 要部署的任务名称
 */
function post () {
  var conf = configObject || soi().config.ENV.deploy;
  var options = parseConf(conf);

  if (conf.files) {
    // 遍历每组要传的文件
    conf.files.forEach(function (pack) {
      var postData;
      var files = glob.sync(pack.from);
      // 分文件传递
      // todo 考虑合并, 毕竟有一个文件传递不成功的话开发者也可能会执行命令重新传递
      files.forEach(function (file) {
        var distDir = path.join(conf.dist, to);
        soi.fs.mkdir(distDir);
        // 读文件
        postData = soi.fs.readFile(file, { encoding: 'utf8' });

        var req = http.request({
          hostname: options.hostname,
          port: options.port,
          path: options.path,
          method: 'POST'
        }, transferCallBack);

        req.on('error', errorCallBack);

        // send
        soi.log.info('Sending: ' + file + ' ==> ' + distDir);
        req.write(JSON.stringify({
          path: distDir,
          data: postData
        }));
        req.end();
      });
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


exports.post = post;
exports.config = config;