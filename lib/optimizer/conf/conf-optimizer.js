/**
 * @fileoverview 编译打包默认配置文件
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

module.exports = {
  // read-in stream should be what encoding
  "encoding"        : "utf8",

  // what kind of files should be ignored
  // new RegExp('\\.(' + js_config.ignoreFileExt.join('|') + ')$', 'i')
  "ignoreFileExt"   : [
    "md",
    "json",
    "txt",
    "tpl",
    "java",
    "py",
    "rb",
    "cs",
    "rar",
    "zip"
  ],

  // debug mode
  "debug"           : true,

  // directories that would not be calculated
  "exclude": {
    "build"         : true,
    "dist"          : true
  },

  // which dir to be relative, defaults to where soi.conf.js located;
  // all path should be calculated based on this directory
  "base_dir"        : "./",

  // after build all files placed, if null value, all files would generated
  // be with the original file, but I highly recommend need a dist directory
  "dist_dir"        : "./dist/js/",

  // js module loader #requirejs
  // module_loader   :  './demo/lib/kernel.js',
  "module_loader"   : "./lib/kernel.js",

  // If debug set to true, we around all resource table and write it to this file
  "map_file"        : "./resource.json",

  // If debug set to true, output_base could be work as
  // the directory where template located
  "output_base"     : "./",

  // file hash length
  "sha1_length"     : 8,

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
  "bundles"         : {
    "swf"           : [],
    "font"          : [],
    "htc"           : [],
    "img"           : [],
    "css"           : [],
    "js"            : []
  }
};