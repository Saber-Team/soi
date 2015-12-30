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
      cacheTo: '../build/.cache',
      mapTo: '../build/map.json',
      scandirs: ['./src'],
      ignorePaths: function(){},
      watch: true,
      cmdWrapper: {
        usestrict: false,
        commentdoc: ''
      }
    });

soi.release.task('dev',
    {
      dir: './dist/',
      mapTo: '../build/map.json',
      cacheTo: '../build/.cache',
      scandirs: ['src'],
      ignorePaths: function(path) {
        return /^_/.test(path)
      },
      cmdWrapper: {
        define: '__d',
        commentdoc: '/* Build by */'
      }
    })
    .addRule(/src\/(.*)\/.*/, {
      to : '/static/$1/'
    })
    .use('less')
    .use('css')
    .use('hash', {
      length: 7,
      encoding: 'hex'
    })
    /*
    .use('uglify', {
      debug: false,
      curl: true,
      eqeqeq: false
    })*/;

