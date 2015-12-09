/**
 * Created by baidu on 15/11/26.
 * @sample
 * plugin list:
 * 1. csscompress
 * 2. less
 * 3. uglify
 * 4. replacer
 * 5. md5
 */

// 配置线上路径
soi
    .addRule(/merchant\/img\/.*\.png$/).to('static/images/')
    .addRule(/merchant\/(.*)\/.*\.js$/).to('static/js/');

soi.deploy.task('dev',
    {
      receiver: 'http://cp01-zhida-jieru.epc.baidu.com:8343/receiver',
      dir: '/home/work/webroot/templates/templates/eva_merchant_zhangshen/',
      cacheTo: '../build/.cache',
      scandirs: ['.']
    })
    .use('replacer', {
      '__NAVBAR__': function($0, $1) {
        if ($0 === '__NAVBAR__') {
          return 'zhida.baidu.com'
        }
      }
    })
    .use('less')
    .postProcess('plugin-tplloader', {
      left: '{{',
      right: '}}'
    });


soi.release.task('dev',
    {
      to: '../dist/',
      mapTo: '../build/map.json',
      cacheTo: '../build/.cache',
      scandirs: ['.'],
      ignorePaths: noop,
      cmdWrapper: {
        define: '__d',
        usestrict: false,
        commentdoc: ''
      }
    })
    // replacer操作
    .use('replacer', {
      '__NAVBAR__': function($0, $1) {
        if ($0 === '__NAVBAR__') {
          return 'zhida.baidu.com'
        }
      }
    })
    .use('less')
    .use('css')
    .use('hash', {
      algorithm: 'sha1',
      length: 9,
      noname: true,
      encoding: 'base64'
    })
    .use('uglify', {
      debug: false,
      curl: true,
      eqeqeq: false
    })
    .postProcess('plugin-tplloader', {
      left: '{{',
      right: '}}'
    });

