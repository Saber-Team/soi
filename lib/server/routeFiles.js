/**
 * @fileoverview 根据roadmap设置提供假数据
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');

/**
 * @param {Object} conf
 * @param {Express.App} app
 */
module.exports = function route (conf, app) {
  var roadmap = conf.roadmap || {};
  var cwd = process.cwd();
  var root = path.join(cwd, conf.rootDir);

  // 因为app.verb或app.use在匹配正则的时候只会用request.baseUrl去匹配
  // 造成很多不便, 所以才用代理全部请求的方式逐一筛选
  app.use('*', function (request, response, next) {
    // 上面的规则会优先匹配
    // nginx也是这种策略
    roadmap.forEach(function (item) {
      var pattern = item.pattern,
          map = item.map,
          content;
      // 直接重定向，读取数据返回
      if (typeof pattern === 'string' &&
          request.originalUrl === pattern) {
        content = soi.utils.readFile(path.join(root, map), {
          encoding: 'utf8'
        });
        response.end(content);
      }
      // 正则匹配路径
      else if (pattern instanceof RegExp &&
          request.originalUrl.match(pattern)) {
        // debugger;
        var dataPath = request.originalUrl.replace(pattern, map);
        content = soi.utils.readFile(path.join(root, dataPath), {
          encoding: 'utf8'
        });
        response.end(content);
      }
      // 放流默认行为
      else {
        next();
      }
    });
  });

};