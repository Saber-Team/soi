/**
 * @fileoverview 发送数据流到服务器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var http = require('http');
var glob = require('glob');

// 配置对象
var configObject;


/**
 * 部署文件
 * @param {String} task 要部署的任务名称
 */
function post() {
  var conf = configObject || soi().config.ENV.deploy;

  if (!conf[task]) {
    soi.log.error('soi().config.ENV.deploy does not have a ' +
        task + ' property.');
  } else {
    soi.log.error('soi().config.ENV does not have a deploy property.');
    process.exit(1);
  }

  var options = {
    hostname: 'www.google.com',
    port: 80,
    path: '/soi_receiver.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var postData = querystring.stringify({
    'msg' : 'Hello World!'
  });
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

// write data to request body
  req.write(postData);
  req.end();
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