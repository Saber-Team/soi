/**
 * @fileoverview release的配置文件样例
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

// 文件的映射(可选的), from本地目录中的文件将会被复制到to的目录中,
// from相对于server-conf.js文件取相对位置,
// to则取rootDir的相对位置.
// from和to支持glob形式的匹配, 也支持自己写逻辑的函数返回字符串
// 关于glob规范见: https://www.npmjs.com/package/glob
var files = [
  {
    from: 'src/template/*.tpl',
    to: 'template/'
  },
  {
    from: 'src/page/*.html',
    to: 'page/'
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
];

soi.config.extend({
  // 本地server配置节点
  release: {
    local: {
      from: '/',
      to: './build',
      files: files,
      combine: false,
      replace: {

      }
    },
    remote: {
      from: '/',
      to: './remote',
      files: files,
      combine: false,
      replace: {

      }
    },
    prod: {
      from: '/',
      to: './build',
      files: files,
      combine: true,
      sha1: true,
      replace: {

      }
    }
  }
});
