// Built-in
var util = require('util');
var path = require('path');
var fs = require('fs');

// 3rd
var rework = require('rework');
var imprt = require('rework-import');
var url = require('rework-plugin-url');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');


/**
 * Class deal with css resource
 * @param soi_config
 * @constructor
 * @implements {Resolver}
 */
var StyleResolver = function(soi_config) {
    this.options = soi_config;
    this.currentFilesItem = null;
};


util.inherits(StyleResolver, Resolver);


/**
 * read all js files and concatenate them
 * helper function used by resolve method
 * @param {Array.<String>} scripts All js files' abs paths
 * @returns {string}
 */
StyleResolver.prototype.combo = function(scripts) {
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
 * calculate module dependency, combo and compress css files
 */
StyleResolver.prototype.resolve = function () {
    // read file
    var content = fs.readFileSync(
        this.options.css_entry_point,
        {
            encoding: this.options.encoding
        });

    // concatenate all files
    var cssText = rework(content)
        .use(imprt({
            encoding: this.options.encoding,
            path: path.resolve(this.options.base_dir, this.options.files.css[0])
        }))
        .use(url(function(url) {
            // todo
            // console.log(url);
            return url;
        }))
        .toString({ compress: true });

    var hex = utils.getStringHash(cssText).hex;
    var _csspath_ = this.options.dist_dir + '/css/' +
        path.basename(this.options.dist_css_file, constants.CSS_FILE_EXT) +
        constants.BUILD_FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

    var dir = path.dirname(_csspath_);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(_csspath_, cssText, { encoding: this.options.encoding });
};


module.exports = StyleResolver;