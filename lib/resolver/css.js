// Built-in
var util = require('util');
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');
var cssurl = require('cssurl');

// Custom
var constants = require('../constants');
var utils = require('../utils');
var Resolver = require('./resolver');
var parser = require('./cssDepsParser');
var RES = require('./cssUrlRes');


/**
 * Class deal with css resource
 * @param soi_config
 * @constructor
 * @implements {Resolver}
 */
var StyleResolver = function(soi_config) {
    this.options = soi_config;
};


util.inherits(StyleResolver, Resolver);


/**
 * Replace all resource url with calculated result.
 * @param pathArray
 */
StyleResolver.prototype.replace = function(pathArray) {
    var ret = '';
    pathArray.forEach(function(path) {
        // read entry point file
        var content = utils.readFile(path,
            {
                encoding: this.options.encoding
            });

        var ast = css.parse(content);
        ast.stylesheet.rules.forEach(function(rule) {
            rule.declarations.forEach(function(declaration) {
                // url("../img/a.png") no-repeat;
                if (declaration.property === 'background' ||
                    declaration.property === 'background-image') {
                    declaration.value.replace();
                }
                // border-image:url(../img/a.png) 30 30 round;
                if (declaration.property === 'border-image') {
                    declaration.value.replace();
                }

                

            });
        });

        ret += content;

    }, this);


    var URLRewriter = cssurl.URLRewriter;
    var rewriter = new URLRewriter(function(url) {
        console.log(url);
        return url;
    });
    var result = rewriter.rewrite(cssText);
};


/**
 * calculate module dependency, combo and compress css files
 */
StyleResolver.prototype.resolve = function() {
// todo css hint

    // If has `css_entry_point` field means it's a self
    // dependency calculated code-style, @import used in
    // key file. If not present, we only walk through
    // files.css;
    if (this.options.css_entry_point) {
        var pathArray = parser.parse(
            this.options.css_entry_point,
            this.options.encoding);

        var cssText = this.replace(pathArray);

        // concatenate all files
        // var cssText = rework(content)
        //    .use(imprt({
        //        encoding: this.options.encoding,
        //        path: path.resolve(this.options.base_dir, this.options.files.css[0])
        //    }))
        //    .toString();
        // .toString({ compress: true });


        var hex = utils.getStringHash(cssText).hex;
        var _csspath_ = this.options.dist_dir + '/' +
            path.dirname(this.options.dist_css_file) + '/' +
            path.basename(this.options.dist_css_file, constants.CSS_FILE_EXT) +
            constants.BUILD_FILENAME_CONNECTOR + hex + constants.CSS_FILE_EXT;

        var dir = path.dirname(_csspath_);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        utils.writeFile(_csspath_, cssText,
            {
                encoding: this.options.encoding
            });

    } else {

    }
};


module.exports = StyleResolver;