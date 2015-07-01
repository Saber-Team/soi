/**
 * @fileoverview 发送数据流到服务器 TODO restler虽然宜用但感觉没必要，考虑原生替换掉
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var http = require('http');
var fs = require('fs');
var url = require('url');
var glob = require('glob');
var path = require('path');
var rest = require('restler');

// 配置对象
var configObject;


/**
 * 部署文件
 */
function deploy () {
  var conf = configObject || soi().ENV.config.deploy;
  var from, to;

  if (conf.files) {
    // 遍历每组要传的文件
    conf.files.forEach(function (pack) {
      from = typeof pack.from === 'function' ? pack.from() : pack.from;
      to = typeof pack.to === 'function' ? pack.to() : pack.to;

      var files = glob.sync(from);
      files.forEach(function (file) {
        // 写入的路径
        var distPath = path.join(conf.dist, to, path.basename(file));
        // 分文件传递
        // todo 考虑合并用一个请求发, 毕竟有一个文件传递不成功的话开发者也可能会执行命令重新传递

        // 发送数据
        soi.log.info('Sending: ' + file + ' ==> ' + distPath);

        var stat = fs.statSync(file);
        // see: https://github.com/danwrong/restler

        rest.post(conf.receiver, {
          multipart: true,
          data: {
            filename: path.basename(file),
            to: distPath,
            file: rest.file(path.resolve(file), path.basename(file), stat.size)
          },
          timeout: 5000
        }).on('success', function(data, response) {
          // debugger;
          // 发送数据
          soi.log.info('Finish send: ' + data);
        }).on('error', function(err, response) {
          // debugger;
          // 传文件失败
          soi.log.warn('Failed request: ' + err.message);
        });

      });

    });
  }

  // 结束进程
  // process.exit(0);
}


/**
 * 设置配置对象
 * @param {Object} obj
 */
function config(obj) {
  configObject = obj;
}


exports.post = deploy;
exports.config = config;