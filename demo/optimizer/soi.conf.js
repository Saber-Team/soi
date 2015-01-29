/**
 * @fileoverview CONFIGURATION FILE
 *   Also used for the demo project
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

soi.config.extend({
  optimizer: {
    // after build all files placed, if null value, all files would generated
    // be with the original file, but I highly recommend need a dist directory
    dist_dir        : './dist/js/',

    // js module loader #requirejs
    // module_loader   :  './demo/lib/kernel.js',
    module_loader   :  './lib/kernel.js',

    // If debug set to true, output_file_base could be work together with output_file
    // it's the directory where template located
    output_base     : './',

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
          files     : ['./assets/img/'],
          exclude   : {},
          defer     : false,
          dist_file : null,
          dist_dir  : './dist/img/'
        }
      ],
      // `input field` means start css file as the entry point
      // *I HIGHLY RECOMMEND* bundle all css files into one
      // So it's only need to provide single entry point
      css           : [
        {
          input     : './assets/css/main.css',
          files     : null,
          exclude   : {},
          defer     : false,
          dist_file : 'build0.css',
          dist_dir  : './dist/css/'
        },
        {
          input     : null,
          files     : [
            './assets/css/reset.css',
            './assets/css/main.css'
          ],
          exclude   : {},
          defer     : false,
          dist_file : 'build1.css',
          dist_dir  : './dist/css/'
        }
      ],
      js            : [
        {
          input     : './assets/js/app.js',
          files     : null,
          exclude   : {},
          defer     : false,
          dist_file : 'build.js',
          dist_dir  : './dist/js/'
        }
      ]
    }
  }
});