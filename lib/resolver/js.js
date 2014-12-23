// Built-in
var util = require('util');
var path = require('path');
var fs = require('fs');

// 3rd
var UglifyJS = require('uglify-js');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var calculate = require('./jsDepsParser');
var uglify_config = require(process.cwd() + '/uglify.compress.conf');


/**
 * Class deal with script resource
 * @constructor
 * @implements {Resolver}
 */
var ScriptResolver = function() {
    this.options = SOI_CONFIG;
};


util.inherits(ScriptResolver, Resolver);


/**
 * read all js files and concatenate them
 * helper function used by resolve method
 * @param {Array.<String>} scripts All js files' abs paths
 * @returns {string}
 */
ScriptResolver.prototype.combo = function(scripts) {
    var content = '';
    scripts.forEach(function(path) {
        var code = fs.readFileSync(path,
            {
                encoding: this.options.encoding
            });
        content += ';' + code;
    }, this);
    return content;
};


/**
 * calculate module dependency, combo and compress js files
 */
ScriptResolver.prototype.resolve = function () {
    // calculate sequence of js files
    // todo resolve input_file array
    var str = '';
    var scripts = calculate(this.options.input_file[0].path, {
        encoding: this.options.encoding
    });
    scripts.unshift(this.options.module_loader);
    scripts = scripts.map(function(jsAbsPath) {
        var rel = path.relative(this.options.output_base, jsAbsPath);

        str += constants.PREFIX_SCRIPT_TAG +
            rel.replace(/\\/g, '/') +
            constants.SUFFIX_SCRIPT_TAG + '\n';

        rel = path.relative(this.options.base_dir, jsAbsPath);
        return rel.replace(/\\/g, '/');

    }, this);

    if (this.options.debug) {
        console.log(scripts);
    }

    // write output file
    if (!fs.existsSync(path.dirname(this.options.output_file))) {
        fs.mkdirSync(path.dirname(this.options.output_file));
    }
    fs.writeFileSync(this.options.output_file, str);


    // combo
    var all_code = this.combo(scripts);
    // compress together
    var ast = UglifyJS.parse(all_code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor(uglify_config);
    ast = ast.transform(compressor);
    all_code = ast.print_to_string(); // get compressed code

    // write to minified file
    var hex = utils.getStringHash(all_code).hex;
    var _jspath_ = this.options.dist_dir + '/' +
        path.dirname(this.options.dist_js_file) + '/' +
        path.basename(this.options.dist_js_file, constants.JS_FILE_EXT) +
        constants.BUILD_FILENAME_CONNECTOR + hex + constants.JS_FILE_EXT;

    var dir = path.dirname(_jspath_);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(_jspath_, all_code, { encoding: this.options.encoding });
};


module.exports = ScriptResolver;