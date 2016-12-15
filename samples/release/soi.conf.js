
'use strict';

// 资源表中包含的资源类型
soi.config.set('types', ['js', 'css']);
// 设置每次不利用编译缓存
soi.config.set('forceRescan', true);
// 设置less处理器
// soi.processor.less.config();

const domain = 'https://bd.static0.com/dev';

soi.release.task('dev',
    {
        dir: './dist/',
        mapTo: './dist/',
        domain: domain,
        scandirs: ['src'],
        loaders: [
            new soi.Loaders.ImageLoader(),
            new soi.Loaders.FontLoader(),
            new soi.Loaders.CSSLoader({
                preProcessors: [
                    soi.processor.less
                ]
            }),
            new soi.Loaders.JSLoader({
                preProcessors: [
                    soi.processor['babel-jsx'],
                    soi.processor['babel-es2015']
                ]
            })
        ],
        pack: {
            '/static/pkg/build.css': ['src/css/*.css'],
            '/static/pkg/build.js': ['src/app/*.js']
        },
        preserveComments: true

    })
    .addRule(/src\/(.*)\/(.*)/, {
        to : function($0, $1, $2) {
            return [domain + '/static', $1, $2].join('/');
        }
    })
    //.addRule(/src\/(.*)\/.*/, {to : '/static/$1/'})
    .use('modux')
    .use('css')
    .use('messid', {ext: ['js', 'css']})
    .use('uglify')
    .use('hash', {
        noname: false,
        encoding: 'hex'
    })
    .use('packager', {noname: false});