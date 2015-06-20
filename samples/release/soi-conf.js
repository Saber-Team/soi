/**
 * @fileoverview release的配置文件样例
 */

'use strict';

soi.config.extend({
  release: {
    // virtualRootDir (vrd) 这个属性非常重要。它的出现有几点意义，
    // 1. 它代表网络根路径，所有本地的静态资源都要相对这个目录生成path部分，从而产生绝对路径类似于
    //    `/static/scripts/lib/jQuery.js`。用到的是pack中的entrance属性。
    // 2. 之所以没有用系统的绝对路径是因为可能打包的系统各异，生成的资源表的key不好统一。
    //    在此生成的绝对路径作为最终资源表中的key存在，不会重复，且在各个系统中统一。
    // 3. 根据配置的domain，生成线上绝对路径。用到的是pack中的dist属性
    prod: {
      domain: '/',
      obscure: true,
      charset: 'utf8',
      virtualRootDir: './src/',
      distRootDir: './build/',
      mapTo: './build/map.json',
      pack: {
        img: [
          {
            files     : [
              'static/img/*.png'
            ],
            ignore    : [],
            dist      : '/online/static/'
          }
        ]
        /*,
         css: [
         {
         entrance  : 'static/css/main.css',
         ignore    : [],
         dist      : '/static/css/'
         },
         {
         files     : [
         'static/css/a.css',
         'static/css/b.css'
         ],
         ignore    : [],
         dist      : '/static/css/'
         }
         ],
         js: [
         {
         entrance  : 'static/js/app.js',
         exclude   : [],
         obscure   : true,
         dist      : '/static/js/'
         }
         ]*/
      },
      replace: {
        'http://zhida.baidu.com:8080/': 'http://zhida.baidu.com',
        'http://zhida.baidu.com:8081/': function() {
          return $0.replace()
        }
      }
    }
  }
});
