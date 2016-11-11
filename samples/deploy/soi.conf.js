
'use strict';

// 配置线上路径
//soi
//  .addRule(/merchant\/img\/.*\.png$/, {
//    to: 'static/images/'
//  })
//  .addRule(/merchant\/(.*)\/.*\.js$/, {
//    to: 'static/js/'
//  });

//const TPLLoader = require('et-plugin-tplloader').TPLLoader;
//const TPLCompiler = require('et-plugin-tplloader').TPLCompiler;
//soi.addCompiler('tpl', TPLCompiler);

// 资源表中包含的资源类型
soi.config.set('types', ['js', 'css']);

soi.deploy.task('dev',
    {
      mapTo: './map/',
      domain: '',
      scandirs: ['src'],
      receiver: 'http://localhost/receiver.php',
      dir: '/Users/baidu/Git/soi/samples/deploy/dist',
      cachedKey: '.cache',
      watch: true,
      loaders: [
        new soi.Loaders.ImageLoader(),
        new soi.Loaders.CSSLoader({
          preProcessors: [
            soi.processor.less
          ]
        }),
        new soi.Loaders.JSLoader()
      ],
      pack: {
        '/static/pkg/build.css': ['src/css/*.css'],
        '/static/pkg/build.js': ['src/app/*.js']
      }
    })
    .addRule(/src\/(.*)\/.*/, {
      to : '/static/$1/'
    })
    .use('messid', {
      ext: ['js', 'css']
    })
    .use('modux')
    .use('packager', {
      noname: false,
      algorithm: 'sha1'
    });
