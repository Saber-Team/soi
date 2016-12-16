
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

const domain = '';

soi.deploy.task('dev',
    {
        mapTo: './map/',
        domain: domain,
        scandirs: ['src'],
        receiver: 'http://localhost/receiver.php',
        dir: '/Users/baidu/Git/soi/samples/deploy/dist',
        cachedKey: '.cache',
        watch: true,
        loaders: [
            new soi.Loaders.ImageLoader(),
            new soi.Loaders.FontLoader(),
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
    .addRule(/src\/(.*)\/(.*)/, {
        to : function($0, $1, $2) {
            return [domain + '/static', $1, $2].join('/');
        }
    })
    .use('messid', {
        ext: ['js', 'css']
    })
    .use('modux')
    .use('packager', {
        noname: false
    });
