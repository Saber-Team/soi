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
var moduleManager = require('./module/manager.js');


var soi_config = require('../soi.conf.js');

// vars
var map = {};
var content;


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

    // absolute path of original js file
    var _path = path.resolve(base, filePath);
    // get the js relative to the current calculate directory
    var origin = path.join(soi_config.base_dir + processJs.currentJsItem);

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


//ignoreFileExt: new RegExp('\\.(' + js_config.ignoreFileExt.join('|') + ')$', 'i'),
    var code = fs.readFileSync(_path, { encoding: soi_config.encoding });
    code = vm.createScript(code);
    var ret = code.runInNewContext(env);
    moduleManager.register({

    });
    content[ret] = _path;
    utils.extend(map, content);

    var str = '';
    // step3 计算依赖\输出
    var scripts = calculate(soi_config.input_file, map, soi_config);
    scripts.unshift(soi_config.module_loader);
    scripts = scripts.map(function(jsAbsPath) {
        var p = path.relative(soi_config.output_base, jsAbsPath);
        str += constants.PREFIX_SCRIPT_TAG + p.replace(/\\/g, '/') +
            constants.SUFFIX_SCRIPT_TAG + '\n';
        p = path.relative(soi_config.base_dir, jsAbsPath);
        return p.replace(/\\/g, '/');
    });

    // console.log(scripts);

    // step4 output file
    fs.writeFileSync(soi_config.output_file, str);

    return scripts;

}


// create all js resources
function traverseJs(jss) {
    // traverse javascript directory list
    jss.forEach(function(file) {
        // store the list item of img config now
        processJs.currentJsItem = file;
        var stat = fs.lstatSync(soi_config.base_dir + file);
        if (stat.isFile() && file.indexOf(constants.JS_FILE_PATH) === file.length - 3) {
            processJs(soi_config.base_dir, file);
        } else if (stat.isDirectory()) {
            var dir = path.resolve(soi_config.base_dir, file);
            var walker = new Walker({
                dirname: dir
            });
            walker.walk(processJs);
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

    // step3

}


// export
exports.config = function(target) {
    utils.extend(soi_config, target);
};
exports.run = go;