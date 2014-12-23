/**
 * @fileoverview CONFIGURATION FILE
 *   Also used for the demo project
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

module.exports = {

  // read-in stream should be what encoding
  encoding        : 'utf8',

  // what kind of files should be ignored
  // new RegExp('\\.(' + js_config.ignoreFileExt.join('|') + ')$', 'i')
  ignoreFileExt   : ['md', 'json', 'txt', 'tpl', 'tmpl', 'java', 'py', 'rb', 'cs', 'h', 'rar', 'zip'],

  // debug mode
  debug           : true,

  // directories that would not be calculated
  preserved       : {
    'imgs'        : true,
    'build'       : true,
    'dist'        : true,
    'templates'   : true,
    'demos'       : true
  },

  // which dir to be relative, defaults to where soi.conf.js located;
  // all path should be calculated based on this directory
  base_dir        : __dirname + '/',

  // after build all files placed, if null value, all files would generated
  // be with the original file, but I highly recommend need a dist directory
  dist_dir        : './demo/dist/',

  // dist file relative to dist_dir
  dist_js_file    : 'js/build.js',

  // js module loader
  module_loader   :  './demo/lib/require.js',

  // logic start file or async load modules entry file
  input_file      :  [
    {
      path    : './demo/assets/js/app.js',
      defer   : false
    }
  ],

  // If debug set to true, we around all js files' path with script html tag
  // and write it to this file, which can be paste into your template or html file
  // for source debugging (or you can use source map)
  output_file     : './output/temp.txt',

  // If debug set to true, output_file_base could be work together with output_file
  // it's the directory where template located
  output_base     : './demo/',

  // Manually added files
  // 需要遍历的目录，这些目录的所有文件都会被计算
  files           : {
    js            : [
      './demo/lib/',
      './demo/assets/js/'
    ]
  },

  // pack config
  // *input: start module from which to calculate
  //         (Note that: If css use import and provide the input field, you
  //         needn't to provide the directory as well, `cause import already
  //         use file path for calculating.)
  // *files: all the needed files located
  // *defer: whether the package will be loaded on demand or first view
  //    false is needed on first view, true means will be loaded on demand.
  //    Default to false.
  // *dist_file: concat file name(will be change suffix with sha1 hash sum)
  // *dist_dir: where concat file located
  bundles         : {
    img           : [
      {
        input     : null,
        files     : [ './demo/assets/img/' ],
        exclude   : {},
        defer     : false,
        dist_file : null,
        dist_dir  : './demo/dist/img/'
      }
    ],
    // `input field` means start css file as the entry point
    // *I HIGHLY RECOMMEND* bundle all css files into one
    // So it's only need to provide single entry point
    css           : [
      {
        input     : './demo/assets/css/test.css',
        files     : [ './demo/assets/css/' ],
        exclude   : {},
        defer     : false,
        dist_file : 'build.css',
        dist_dir  : './demo/dist/css/'
      },
      {
        input     : './demo/assets/css/starter.css',
        files     : [ './demo/assets/css/' ],
        exclude   : {},
        defer     : true,
        dist_file : 'async.css',
        dist_dir  : './demo/dist/css/'
      }
    ],
    js            : [
      {
        input     : './demo/assets/js/app.js',
        files     : [ './demo/lib/', './demo/assets/js/' ],
        exclude   : {},
        defer     : false,
        dist_file : 'build.js',
        dist_dir  : './demo/dist/js/'
      }
    ]
  }

};
