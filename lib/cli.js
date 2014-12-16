// system modules
var fs = require('fs');
var path = require('path');
var vm = require('vm');

// third-party modules
var UglifyJS = require('uglify-js');

// custom modules
var constants = require('./constants');
var utils = require('./utils');
var Walker = require('./dirwalker/walker');
var Resource = require('./resource/resource');
var rscTable = require('./resource/table');
var moduleManager = require('./module/manager');
var environment = require('./env');
var calculate = require('./calculate');

// config file
var soi_config = require('../soi.conf.js');


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


// read all js files and concatenate them
function combo(scripts) {

}


// helper function used by traverseJs method
function processJs(base, filePath) {
    // absolute path of original js file
    var _path = path.resolve(base, filePath);

    // get the js relative to the current calculate directory
    var origin = path.join(soi_config.base_dir + processJs.currentJsItem);

    // create resource instance but without generating any js file
    var resource = Resource.create({
        origin  : origin,
        type    : 'js',
        path    : _path,
        encoding: soi_config.encoding,
        dist    : soi_config.dist_dir
    });

    // register resource table
    rscTable.register({
        type    : 'js',
        key     : _path,
        value   : resource
    });

    // register module
    var code = fs.readFileSync(_path, { encoding: soi_config.encoding });
    code = vm.createScript(code);
    var module = code.runInNewContext(environment);
    module.setPath(_path);
    moduleManager.register({
        id      : resource.id,
        module  : module
    });


    // calculate sequence of js files
    // todo resolve input_file array
    var str = '';
    var scripts = calculate(soi_config.input_file[0].path, {
        encoding: soi_config.encoding
    });
    scripts.unshift(soi_config.module_loader);
    scripts = scripts.map(function(jsAbsPath) {
        var rel = path.relative(soi_config.output_base, jsAbsPath);
        str += constants.PREFIX_SCRIPT_TAG +
            rel.replace(/\\/g, '/') +
            constants.SUFFIX_SCRIPT_TAG + '\n';
        rel = path.relative(soi_config.base_dir, jsAbsPath);
        return rel.replace(/\\/g, '/');
    });

    if (soi_config.debug) {
        console.log(scripts);
    }
    // write output file
    fs.writeFileSync(soi_config.output_file, str);


    // todo combo
    var all_code = combo(scripts);

    // compress together
    var ast = UglifyJS.parse(all_code);
    ast.figure_out_scope();
    var compressor = UglifyJS.Compressor({
        sequences     : true,  // join consecutive statements with the “comma operator”
        properties    : true,  // optimize property access: a["foo"] → a.foo
        dead_code     : true,  // discard unreachable code
        drop_debugger : true,  // discard “debugger” statements
        unsafe        : false, // some unsafe optimizations (see below)
        conditionals  : true,  // optimize if-s and conditional expressions
        comparisons   : true,  // optimize comparisons
        evaluate      : true,  // evaluate constant expressions
        booleans      : true,  // optimize boolean expressions
        loops         : true,  // optimize loops
        unused        : true,  // drop unused variables/functions
        hoist_funs    : true,  // hoist function declarations
        hoist_vars    : false, // hoist variable declarations
        if_return     : true,  // optimize if-s followed by return/continue
        join_vars     : true,  // join var declarations
        cascade       : true,  // try to cascade `right` into `left` in sequences
        side_effects  : true,  // drop side-effect-free statements
        warnings      : true,  // warn about potentially dangerous optimizations/code
        global_defs   : {}     // global definitions
    });
    ast = ast.transform(compressor);
    all_code = ast.print_to_string(); // get compressed code

    // write to minified file
    // todo
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
    ['dist_dir', 'module_loader', 'output_file'].forEach(function(item) {
        if (soi_config[item]) {
            soi_config[item] = path.resolve(soi_config.base_dir, soi_config[item]);
        }
    });

    if (soi_config.input_file) {
        soi_config.input_file.forEach(function(input) {
            input.path = path.resolve(
                soi_config.base_dir,
                input.path);
        });
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