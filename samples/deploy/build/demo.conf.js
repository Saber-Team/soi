/**
 * Created by baidu on 15/12/15.
 */
// 配置线上路径
soi
    .addRule(/merchant\/img\/.*\.png$/, {
        to: 'static/images/'
    })
    .addRule(/merchant\/(.*)\/.*\.js$/, {
        to: 'static/js/'
    });

soi.deploy.task('dev',
    {
        receiver: 'http://cp01-zhida-mkt.epc.baidu.com:8343/receiver',
        dir: '/home/work/webroot/soi-test',
        cacheTo: '../build/.cache',
        mapTo: '../build/map.json',
        scandirs: ['.'],
        ignorePaths: function(){},
        watch: true,
        cmdWrapper: {
            usestrict: false,
            commentdoc: ''
        }
    });

soi.release.task('dev',
    {
        dir: './build/',
        mapTo: '../build/map.json',
        cacheTo: '../build/.cache',
        scandirs: ['.'],
        ignorePaths: function(){},
        cmdWrapper: {
            define: '__d',
            commentdoc: ''
        }
    });

