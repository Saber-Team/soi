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
  release: {
    // 这个属性非常重要. 它的出现有几点意义，
    // 1. 它代表网络根路径，所有的静态资源都要相对这个目录生成path部分，从而产生绝对路径类似于
    //    `/static/scripts/lib/jQuery.js`.
    // 2. 之所以没有用系统的绝对路径是因为可能打包的系统各异，不好统一。
    //    而在此生成的绝对路径作为最终资源表中的key存在，不会重复，且在各个系统中统一。
    virtualRootDir: './src/',
    prod: {
      domain: 'http://zhida.baidu.com/',
      prefixPath: './build',
      files: files,

      sha1: true,
      replace: {
        'http://zhida.baidu.com:8080/': 'http://zhida.baidu.com',
        'http://zhida.baidu.com:8081/': function() {
          return $0.replace()
        }
      }
    }
  }
});
