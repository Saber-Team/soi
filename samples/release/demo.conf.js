/**
 * Created by baidu on 15/12/15.
 */
// 配置线上路径
//soi
//    .addRule(/merchant\/img\/.*\.png$/, {
//      to: 'static/images/'
//    })
//    .addRule(/merchant\/(.*)\/.*\.js$/, {
//      to: 'static/js/'
//    });

soi.deploy.task('dev',
    {
      receiver: 'http://cp01-zhida-mkt.epc.baidu.com:8343/receiver',
      dir: '/home/work/webroot/soi-test',
      mapTo: './map.json',
      cacheTo: '../build/.cache',
      scandirs: ['src'],
      loaders: ['img', 'css'],
      watch: true,
      cmdWrapper: {
        usestrict: false,
        commentdoc: ''
      }
    });

soi.release.task('dev',
    {
      dir: './dist/',
      mapTo: './dist/map.json',
      cacheTo: '../build/.cache',
      scandirs: ['src'],
      loaders: ['img', 'css'],
      cmdWrapper: {
        define: '__d',
        commentdoc: '/* Build by @Saber.T */'
      }
    })
    .addRule(/src\/(.*)\/.*/, {
      to : '/static/$1/'
    })
    .use('less')
    .use('messid')
    .use('css')
    .use('hash', {
      length: 7,
      encoding: 'base64',
      noname: true
    });

