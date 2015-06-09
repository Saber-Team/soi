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
 * 传输文件过程回调函数
 * @param {http.ServerResponse} res
 */
function responseCallBack (res) {
  debugger;
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
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
 * 生成request配置对象
 * @param {Object} conf
 * @returns {*}
 */
function buildRequestOptions (conf) {
  var options = parseConf(conf);
  return {
    hostname: options.hostname,
    port: options.port,
    path: options.path,
    method: 'POST',
    keepAlive: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
}

/**
 * 部署文件
 * @param {String} task 要部署的任务名称
 */
function post () {
  var conf = configObject || soi().ENV.config.deploy;
  var options = buildRequestOptions(conf);
  var req, from, to;
  var postData;

  if (conf.files) {
    // 遍历每组要传的文件
    conf.files.forEach(function (pack) {
      from = typeof pack.from === 'function' ? pack.from() : pack.from;
      to = typeof pack.to === 'function' ? pack.to() : pack.to;
      var files = glob.sync(from);
      // 分文件传递
      // todo 考虑合并用一个请求发, 毕竟有一个文件传递不成功的话开发者也可能会执行命令重新传递
      files.forEach(function (file) {
        // 写入的路径
        var distPath = path.join(conf.dist, to, path.basename(file));
        // 读文件
        postData = soi.fs.readFile(file, { encoding: 'utf8' });
        postData = "path=" + encodeURIComponent(distPath) + "&data" + encodeURIComponent(postData);
        req = http.request(options, responseCallBack);
        req.on('error', errorCallBack);

        // 发送数据
        soi.log.info('Sending: ' + file + ' ==> ' + distPath);
        req.write(postData);
        req.end();
      });
    });
  }

  // 结束进程
  //process.exit(0);
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