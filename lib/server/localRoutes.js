/**
 * @fileoverview 根据roadmap设置提供假数据
 * @author
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

//  app.use('/getUserInfo', function (req, res) {
//    debugger;
//    var dataPath = req.originalUrl.replace(/\/getUserInfo\?uid=(\d+)/, 'static/test/user_$1.json');
//    var content = soi.utils.readFile(path.join(root, dataPath), {
//      encoding: 'utf8'
//    });
//    res.end(content);
//  });

  app.use('*', function (request, response) {
    roadmap.forEach(function (item) {
      var pattern = item.pattern,
          map = item.map;
      // 直接重定向，读取数据返回
      if (typeof pattern === 'string') {
        var content = soi.utils.readFile(path.join(root, map), {
          encoding: 'utf8'
        });
        res.end(content);
      }
      // 正则匹配路径
      else if (pattern instanceof RegExp) {
        debugger;
        var dataPath = req.originalUrl.replace(pattern, map);
        var content = soi.utils.readFile(path.join(root, dataPath), {
          encoding: 'utf8'
        });
        res.end(content);

      } else if (isParamLike) {

      }

    });
  });



//  app.param('id', function (req, res, next, id) {
//    console.log('CALLED ONLY ONCE');
//    next();
//  });
}