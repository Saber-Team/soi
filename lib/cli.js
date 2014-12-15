// system modules
var fs = require('fs');
var path = require('path');

// third-party modules
var UglifyJS = require('uglify-js');

// custom modules
var calculate = require('./calculate.js');
var traverse = require('./traverse.js');
var constants = require('./constants.js');
var utils = require('./utils.js');
var Walker = require('./dirwalker/walker.js');
var Resource = require('./resource/resource.js');
var rscTable = require('./resource/table.js');


var soi_config = require('../soi.conf.js');

// vars
var map = {};
var content, str = '';


// helper function used by traverseImg method
function processImg(base, filePath) {
    // absolute path of original image file
    var _path = path.resolve(base, filePath);
    // get the image relative to the current calculate directory
    var origin = path.join(soi_config.base_dir + processImg.currentImgItem);

    var resource = Resource.create({
        origin  : origin,
        type    : 'img',
        path    : _path,
        encoding: soi_config.encoding,
        dist    : soi_config.dist_dir
    });
    rscTable.register({
        type    : 'img',
        key     : _path,
        value   : resource
    });
}


// create all image resources
function traverseImg(img) {
    // traverse img directory list
    img.forEach(function(file) {
        // store the list item of img config now
        processImg.currentImgItem = file;
        var stat = fs.lstatSync(soi_config.base_dir + file);
        if (stat.isFile() && constants.RE_IMG_FILE_EXT.test(file)) {
            processImg(soi_config.base_dir, file);
        } else if (stat.isDirectory()) {
            var dir = path.resolve(soi_config.base_dir, file);
            var walker = new Walker({
                dirname: dir
            });
            walker.walk(processImg);
        }
    });
}


// create all css resources
function traverseCss(css) {
    css.forEach(function(file) {
        var stat = fs.lstatSync(soi_config.base_dir + file);
        if (stat.isFile() && path.extname(file) === constants.CSS_FILE_EXT) {
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


// helper function used by traverseJs method
function processJs(base, filePath) {
    // absolute path of original image file
    var _path = path.resolve(base, filePath);
    // get the image relative to the current calculate directory
    var origin = path.join(soi_config.base_dir + processJs.currentImgItem);

    var resource = Resource.create({
        origin  : origin,
        type    : 'js',
        path    : _path,
        encoding: soi_config.encoding,
        dist    : soi_config.dist_dir
    });
    rscTable.register({
        type    : 'js',
        key     : _path,
        value   : resource
    });
}


// create all js resources
function traverseJs(jss) {
    // traverse javascript directory list
    jss.forEach(function(file) {
        // store the list item of img config now
        processImg.currentImgItem = file;
        var stat = fs.lstatSync(soi_config.base_dir + file);
        if (stat.isFile() && file.indexOf(constants.JS_FILE_PATH) === file.length - 3) {
            processJs(soi_config.base_dir, file);
            // store absolute path
            var _path = path.resolve(soi_config.base_dir, file);
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
        traverseImg(img);
    }

    if (css && css.length > 0) {
        // traverseCss(css);
    }

    if (jss && jss.length > 0) {
        traverseJs(jss);
    }
}

// process all relative paths
function processConfigOptions() {
    ['dist_dir', 'module_loader', 'output_file_base', 'input_file'].forEach(function(item) {
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

    // step 1 normalize all config paths
    processConfigOptions();

    // step2 resolve all assets and create resources
    parseFiles();

    //
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
exports.config = function(target) {
    utils.extend(soi_config, target);
};
exports.run = go;