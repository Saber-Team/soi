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
 * @param {http.Response} res
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
 * 部署文件
 * @param {String} task 要部署的任务名称
 */
function post () {
  var conf = configObject || soi().config.ENV.deploy;
  var options = parseConf(conf);

  if (conf.files) {
    conf.files.forEach(function (pack) {
      var postData;
      var files = glob.sync(pack.from);
      files.forEach(function (file) {
        var distDir = path.join(root, to);
        soi.fs.mkdir(distDir);
        // 读文件
        postData = soi.fs.readFile(file, { encoding: 'utf8' });

        var req = http.request({
          hostname: options.hostname,
          port: options.port,
          path: options.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        }, transferCallBack);

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        // write data to request body
        req.write(postData);
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