/**
 * @fileoverview Provide demo file to config your javascript code of webApp.
 *   All the paths and options can be changed to fit your own projects.
 *   I will explain it in the file.
 * @modified Leo.Zhang
 * @email zmike86@gmail.com
 */

/**
 * Return the configuration object to build your js code
 * @type {Object}
 */
module.exports = {
    //
    imports: [],  // 需要额外引入的已经计算过的路径映射，必须是json格式
    //
    encoding: 'utf8',
    //
    jsFileExt: '.js',
    //
    otherFileExt: new RegExp('\\.(md|css|html|json|txt|tpl|tmpl)$', 'i'),

    debug: false,

    Preserved: {
        'imgs': true,
        'img': true,
        'build': true,
        'tpl': true,
        'html': true,
        'css': true,
        'demos': true,
        'kernel.js': true,
        'sogou.js': true,
        'license': true
    },
    // loader js file to added before all other js files
    boot: '../../lib/require.js',
    // 页面或者部署位置的基地址，计算相对路径
    // 这个地址应该是相对于打包脚本的地址
    // 需要遍历的目录，这些目录的所有js文件都会被计算
    dirs: ['../../lib/', '../../lib/SMT/', '../../projects/page/assets/js/'],
    build_base: './',
    output_base: '../../projects/page/assets/tpl/',
    input_file:  '../../projects/page/assets/js/boot.js', // 页面入口模块
    output_file: './output/temp.txt' // 输出文件地址
};
