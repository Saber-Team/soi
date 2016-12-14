
'use strict';

// 资源表中包含的资源类型
soi.config.set('types', ['js', 'css']);
// 设置每次不利用编译缓存
soi.config.set('forceRescan', true);
// 设置less处理器
// soi.processor.less.config();

soi.release.task('dev',
  {
    dir: './dist/',
    mapTo: './dist/',
    domain: 'https://example.static0.com/av',
    scandirs: ['src'],
    loaders: [
      new soi.Loaders.ImageLoader(),
      new soi.Loaders.CSSLoader({
        preProcessors: [
          soi.processor.less
        ]
      }),
      new soi.Loaders.JSLoader({
        preProcessors: [
          soi.processor['babel-jsx']
        ]
      })
    ],
    pack: {
      '/static/pkg/build.css': ['src/css/*.css'],
      '/static/pkg/build.js': ['src/app/*.js']
    },
    preserveComments: true

  })
  //.addRule(/src\/.*\.tpl/, {to : '/static/page/'})
  //.addRule(/src\/(.*)\/.*/, {to : '/static/$1/'})
  .use('modux')
  .use('css')
  .use('messid', {ext: ['js', 'css']})
  .use('uglify')
  .use('hash', {noname: false})
  .use('packager', {noname: false});