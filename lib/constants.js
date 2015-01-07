// config
exports.VERSION = '0.6.0';


exports.PREFIX_SCRIPT_TAG = '<script type="text/javascript" src="';
exports.SUFFIX_SCRIPT_TAG = '"></script>';

exports.CSS_FILE_EXT = '.css';
exports.JS_FILE_EXT = '.js';
exports.RE_IMG_FILE_EXT = /\\.(png|jpg|jpeg|gif)$/;

exports.JS_CODE_CONNECTOR = ';';
exports.BUILD_FILENAME_CONNECTOR = '_';

exports.DEFINE = '_def("%s", [%a], %f);';
exports.REQUIRE = '_req([%a], %f);';