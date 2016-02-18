
// 配置线上路径
//soi
//  .addRule(/merchant\/img\/.*\.png$/, {
//    to: 'static/images/'
//  })
//  .addRule(/merchant\/(.*)\/.*\.js$/, {
//    to: 'static/js/'
//  });

soi.release.task('dev',
  {
    dir: './dist/',
    mapTo: './dist/map.json',
    domain: 'http://static.fb.cn/',
    scandirs: ['src'],
    loaders: [
      new soi.Loaders.ImageLoader(),
      new soi.Loaders.CSSLoader(),
      new soi.Loaders.JSLoader()
    ],
    pack: {
      '/static/pkg/build.css': ['src/css/*.css'],
      '/static/pkg/build.js': ['src/js/*.js']
    }
  })
  .addRule(/src\/(.*)\/.*/, {
    to : '/static/$1/'
  })
  .use('wrapper', {
    define: '__d',
    commentdoc: '/* Build by @Saber.T */'
  })
  .use('less')
  .use('messid')
  .use('uglify')
  .use('hash', {
    length: 7,
    encoding: 'hex',
    noname: false
  })
  .use('packager', {
    length: 7,
    encoding: 'hex',
    noname: false
  });