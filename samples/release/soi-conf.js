/**
 * @fileoverview server模块的配置文件样例
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

soi.config.extend({
  // 本地server配置节点
  release: {
    from: '/',
    to: './build',
    // 文件的映射(可选的), from本地目录中的文件将会被复制到to的目录中,
    // from相对于server-conf.js文件取相对位置,
    // to则取rootDir的相对位置.
    // from和to支持glob形式的匹配, 也支持自己写逻辑的函数返回字符串
    // 关于glob规范见: https://www.npmjs.com/package/glob
    files: [
      {
        from: 'src/template/*.tpl',
        to: 'template/'
      },
      {
        from: 'src/page/*.html',
        to: 'page/'
      },
      {
        from: 'src/static/test/*.*',
        to: 'static/test/'
      },
      {
        from: 'src/static/js/*.js',
        to: 'static/js/'
      },
      {
        from: function () {
          return 'src/static/css/*.css'
        },
        to: function () {
          return 'static/css/'
        }
      }
    ],
    // 代码中ajax请求的接口, 用于前端自己模拟数据, post方式目前没有好的模拟代码.
    // 需要前端和服务端开发在开发机服务器连调.
    // 配置的key和value应该为以下两种情况
    // 1. 纯字符串精准匹配
    // 2. 正则模糊匹配
    roadmap: [
      {
        pattern: '/',
        map: 'page/index.html'
      },
      {
        pattern: /\/getUserInfo\?uid=(\d+)/,
        map: 'static/test/user_$1.json'
      },
      {
        pattern: /\/getAppList\?from=(\d+)&to=(\d+)/,
        map: 'static/test/apps_$1_$2.json'
      }
    ]
  }
});
