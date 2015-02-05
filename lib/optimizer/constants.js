var base = soi.const;

// config
exports.VERSION = base.version;
exports.nullFunction = base.nullFunction;

exports.PREFIX_SCRIPT_TAG = '<script type="text/javascript" src="';
exports.SUFFIX_SCRIPT_TAG = '"></script>';

exports.CSS_FILE_EXT = '.css';
exports.JS_FILE_EXT = '.js';

exports.RE_IMG_FILE_EXT = /\\.(png|jpg|jpeg|gif)$/;
exports.RE_FONT_FILE_EXT = /\\.(ttf|eot|otf|woff)$/;
exports.RE_SWF_FILE_EXT = /\\.swf$/;
exports.RE_HTC_FILE_EXT = /\\.htc$/;

exports.JS_CODE_CONNECTOR = ';';
exports.FILENAME_CONNECTOR = '_';

exports.DEFINE = '_def("%s", [%a], %f);';
exports.REQUIRE = '_req([%a], %f);';