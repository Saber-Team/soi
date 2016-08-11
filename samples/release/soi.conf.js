
'use strict';

// 配置线上路径
//soi
//  .addRule(/merchant\/img\/.*\.png$/, {
//    to: 'static/images/'
//  })
//  .addRule(/merchant\/(.*)\/.*\.js$/, {
//    to: 'static/js/'
//  });

const TPLLoader = require('et-plugin-tplloader').TPLLoader;
const SimpleTPLCompiler = require('et-plugin-tplloader').TPLCompiler;
soi.addCompiler('tpl', SimpleTPLCompiler);

// 资源表中包含的资源类型
soi.config.set('types', ['js', 'css', 'tpl']);

soi.release.task('dev',
  {
    dir: './dist/',
    mapTo: './dist/resource.json',
    domain: 'https://fbstatic.com/static',
    scandirs: ['src'],
    loaders: [
      new soi.Loaders.ImageLoader(),
      new soi.Loaders.CSSLoader(),
      new soi.Loaders.JSLoader(),
      new TPLLoader()
    ],
    pack: {
      '/static/pkg/build.css': ['src/css/*.css'],
      '/static/pkg/build.js': ['src/app/*.js']
    },
    preserveComments: true
  })
  .addRule(/src\/.*\.tpl/, {
    to : '/static/page/'
  })
  .addRule(/src\/(.*)\/.*/, {
    to : '/static/$1/'
  })
  .use('wrapper', {
    define: '__d'
  })
  //.use('css')
  .use('css-mangler')
  .use('less', {
      ignore: function(path) {
        return /_.less$/.test(path);
      }
    })
  .use('messid', {
    ext: ['js', 'css']
  })
  //.use('uglify')
  .use('hash', {
    noname: false,
    algorithm: 'sha1'
  })
  .use('packager', {
    noname: false,
    algorithm: 'sha1'
  });