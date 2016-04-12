
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

//soi.config.set('forceRescan', true);

soi.release.task('dev',
  {
    dir: './dist/',
    mapTo: './dist/resource.json',
    domain: '',
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
    }
  })
  .addRule(/src\/(.*)\/.*/, {
    to : '/static/$1/'
  })
  .use('wrapper', {
    define: '__d'
  })
  .use('css')
  .use('less')
  .use('messid')
  .use('uglify')
  .use('hash', {
    noname: true
  })
  .use('packager', {
    length: 9,
    encoding: 'base64',
    noname: true
  });