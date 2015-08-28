exports.PREFIX_SCRIPT_TAG = '<script type="text/javascript" src="';
exports.SUFFIX_SCRIPT_TAG = '"></script>';

exports.CSS_FILE_EXT = '.css';
exports.JS_FILE_EXT = '.js';

exports.RE_IMG_FILE_EXT = /\.(png|jpg|jpeg|gif)$/;
exports.RE_FONT_FILE_EXT = /\.(ttf|eot|otf|woff)$/;
exports.RE_SWF_FILE_EXT = /\.swf$/;
exports.RE_HTC_FILE_EXT = /\.htc$/;

exports.JS_CODE_CONNECTOR = ';';
exports.FILENAME_CONNECTOR = '_';

exports.DEFINE = '("%s", [%a], %f);';
exports.REQUIRE = '([%a], %f);';

// A regexp to filter `require('xxx')`
exports.cjsRequireRegExp = /\brequire\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g;
// A regexp to drop comments in source code
exports.commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;