/**
 * @fileoverview CONFIGURATION FILE
 * Also used for the demo project
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

module.exports = {

    // read-in stream should be what encoding
    encoding        : 'utf8',

    // what kind of files should be ignored
    ignoreFileExt   : ['md', 'json', 'txt', 'tpl', 'tmpl', 'java', 'py', 'rb', 'cs', 'h', 'rar', 'zip'],

    // debug mode
    debug           : true,

    // directories that would not be calculated
    preserved       : {
        'imgs'      : true,
        'build'     : true,
        'dist'      : true,
        'templates' : true,
        'demos'     : true
    },

    // which dir to be relative, defaults to where soi.conf.js located;
    // all path should be calculated based on this directory
    base_dir        : __dirname + '/../',

    // after build all files placed, if null value, all files would generated
    // be with the original file, but I highly recommend need a dist directory
    dist_dir        : './demo/dist/',

    // js module loader
    module_loader   :  './demo/lib/require.js',

    // If debug set to true, we around all js files' path with script html tag
    // and write it to this file, which can be paste into your template or html file
    // for source debugging (or you can use source map)
    output_file     : './output/temp.txt',

    // If debug set to true, output_file_base could be work together with output_file
    output_file_base: './demo/app.html',

    // Manually added files
    // 需要遍历的目录，这些目录的所有文件都会被计算
    files: {
        css: [
            './demo/assets/css/'
        ],
        js: [
            './demo/lib/',
            './demo/assets/js/'
        ],
        img: [
            './demo/img/'
        ]
    }

};
