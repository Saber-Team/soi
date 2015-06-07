/**
 * @fileoverview 发送数据流到服务器
 * @author zmike86
 * @email zmike86@gmail.com
 */

'use strict';

var http = require('http');

/**
 * 部署文件
 * @param {?Object} config 配置对象, 若不传递默认取config.ENV.deploy配置节点
 * @param {Object} argv 命令行参数对象
 */
function post(config, argv) {
  var deploy = soi().config.ENV.deploy;
  var conf;
  // 要部署的任务名称
  var task = argv._[0];

  if (config) {
    conf = config;
  } else if (deploy) {
    conf = deploy[task];
    if (!conf) {
      soi.log.error('soi().config.ENV.deploy does not have a ' +
          task + ' property.');
    }
  } else {
    soi.log.error('soi().config.ENV does not have a deploy property.');
    process.exit(1);
  }
  /*{
    hostname: 'www.google.com',
    port: 80,
    path: '/soi_receiver.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  }*/

  var postData = querystring.stringify({
    'msg' : 'Hello World!'
  });
  var req = http.request(config, function(res) {
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

exports.post = post;