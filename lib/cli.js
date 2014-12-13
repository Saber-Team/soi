// system modules
var fs = require('fs');
var path = require('path');

// custom modules
var calculate = require('./calculate.js');
var traverse = require('./traverse.js');
var constants = require('./constants.js');
var utils = require('./utils.js');
var Resource = require('./resource.js');

var soi_config = require('../config/soi.conf.js');

// vars
var map = {};
var resources = {};
var content, str = '';

// create all image resources
function parseImgFile(img) {
    img.forEach(function(file) {
        // single img file
        if (constants.RE_IMG_FILE_EXT.test(file)) {
            // store absolute path
            var _path = path.resolve(soi_config.base_dir, file);
            resources.img[_path] = Resource.create({
                type: 'img',
                path: _path
            });
        }
        // directory
        else if (utils.isDirectory(file)) {
            var dir = path.resolve(soi_config.base_dir, file);
            var files = fs.readdirSync(dir);
            files.forEach(function(f) {
                // store absolute path
                var _path = path.resolve(f, soi_config.base_dir);
                resources.img[_path] = Resource.create({
                    type: 'img',
                    path: _path
                });
            });
        }
    });
}

// create all css resources
function parseCssFile(css) {
    css.forEach(function(file) {
        // single css file
        if (path.extname(file) === constants.CSS_FILE_EXT) {
            // store absolute path
            var _path = path.resolve(file, soi_config.base_dir);
            resources.css[_path] = Resource.create({
                type: 'css',
                path: _path
            });
        }
        // directory
        else if (utils.isArray(file)) {

            file.forEach(function(f) {
                // store absolute path
                var _path = path.resolve(f, soi_config.base_dir);
                resources.css[_path] = Resource.create({
                    type: 'css',
                    path: _path
                });
            })
        }
    });
}

// create all js resources
function parseJsFile(jss) {
    jss.forEach(function(file) {
        if (file.indexOf(constants.JS_FILE_PATH) === file.length - 3) {
            // store absolute path
            var _path = path.resolve(file, soi_config.base_dir);
            resources.js[_path] = Resource.create({
                type: 'js',
                path: _path
            });
        } else if (utils.isArray(file)) {
            file.forEach(function(f) {
                // store absolute path
                var _path = path.resolve(f, soi_config.base_dir);
                resources.js[_path] = Resource.create({
                    type: 'js',
                    path: _path
                });
            })
        }
    });
}

// create all resources
function parseFiles() {
    var css = soi_config.files.css,
        jss = soi_config.files.js,
        img = soi_config.files.img;

    if (img && img.length > 0) {
        resources.img = {};
        parseImgFile(img);
    }

    if (css && css.length > 0) {
        resources.css = {};
        parseCssFile(css);
    }

    if (jss && jss.length > 0) {
        resources.js = {};
        parseJsFile(jss);
    }
}

// process all relative paths
function processConfigOptions() {
    ['dist_dir', 'module_loader', 'output_file_base'].forEach(function(item) {
        if (soi_config[item]) {
            soi_config[item] = path.resolve(soi_config.base_dir, soi_config[item]);
        }
    });

    if (soi_config.output_file) {
        soi_config.output_file = path.resolve(
            soi_config.output_file_base,
            soi_config.output_file);
    }
}


function go() {

    // step 1
    processConfigOptions();

    // step2 resolve all assets
    parseFiles();

    /*
    soi_config.dirs.forEach(function(dir) {
        traverse.config({
            Preserved: js_config.Preserved,
            jsFileExt: js_config.jsFileExt,
            ignoreFileExt: new RegExp('\\.(' + js_config.ignoreFileExt.join('|') + ')$', 'i'),
            encoding: js_config.encoding,
            debug: js_config.debug,
            dir: path.resolve(dir)
        });
        content = traverse.exec(js_config.base_dir, path.resolve(dir));
        utils.extend(map, content);
    });

    // step3 计算依赖\输出
    var input = js_config.module_loader;
    var bootfile = js_config.module_loader;
    var scripts = calculate(input, map, js_config);
    var output_base = path.resolve(js_config.output_base);
    var base_dir = path.resolve(js_config.base_dir);

    scripts.unshift(bootfile);
    scripts = scripts.map(function(abspath) {
        var p = path.relative(output_base, abspath);
        str += constants.PREFIX_SCRIPT_TAG + p.replace(/\\/g, '/') +
            constants.SUFFIX_SCRIPT_TAG + '\n';
        p = path.relative(base_dir, abspath);
        return p.replace(/\\/g, '/');
    });

    // console.log(scripts);

    // step4 写入json内容
    fs.writeFileSync(path.resolve(js_config.output_file), str);

    return scripts;*/

}

// export
exports.config = function(src) {
    utils.extend(js_config, src);
};
exports.run = go;