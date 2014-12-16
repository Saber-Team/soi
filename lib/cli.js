// system modules
var fs = require('fs');
var path = require('path');

// third-party modules
var UglifyJS = require('uglify-js');

// custom modules
var constants = require('./constants');
var utils = require('./utils');
var Walker = require('./dirwalker/walker');
var Resource = require('./resource/resource');
var ProcesssorFactory = require('./processor/factory');
var rscTable = require('./resource/table');
var calculate = require('./calculate');

// config file
var soi_config = require('../soi.conf.js');


function processCss(base, filePath) {
    // absolute path of original js file
    var _path = path.resolve(base, filePath);

    // get the js relative to the current calculate directory
    var origin = path.join(soi_config.base_dir + processCss.currentCssItem);

    // create resource instance but without generating any style sheets
    var resource = Resource.create({
        origin  : origin,
        type    : 'css',
        path    : _path,
        encoding: soi_config.encoding,
        dist    : soi_config.dist_dir
    });

    // register resource table
    rscTable.register({
        type    : 'css',
        key     : _path,
        value   : resource
    });

}


function resolveCss() {

}


// create all css resources
function traverseCss(css) {
    // traverse css directory list
    css.forEach(function(file) {
        // store the list item of css config now
        processCss.currentCssItem = file;
        var stat = fs.lstatSync(soi_config.base_dir + file);
        if (stat.isFile() && file.indexOf(constants.CSS_FILE_EXT) === file.length - 3) {
            processCss(soi_config.base_dir, file);
        } else if (stat.isDirectory()) {
            var dir = path.resolve(soi_config.base_dir, file);
            var walker = new Walker({
                dirname: dir
            });
            walker.walk(processCss);
        }
    });
}


// read all js files and concatenate them
// helper function used by resolveJs method
function combo(scripts) {
    var content = '';
    scripts.forEach(function(path) {
        var code = fs.readFileSync(path,
            {
                encoding: soi_config.encoding
            });
        content += ';' + code;
    });
    return content;
}


// calculate module dependency, combo and compress js files
function resolveJs() {
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
    if (!fs.existsSync(path.dirname(soi_config.output_file))) {
        fs.mkdirSync(path.dirname(soi_config.output_file));
    }
    fs.writeFileSync(soi_config.output_file, str);


    // combo
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
    var hex = utils.getStringHash(all_code).hex;
    var _jspath_ = soi_config.dist_dir + '/' +
        path.basename(soi_config.dist_js_file, constants.JS_FILE_EXT) +
        '_' + hex + constants.JS_FILE_EXT;
    fs.writeFileSync(_jspath_, all_code, { encoding: soi_config.encoding });
}


// create all resources
function parseFilesOptions() {
    var css = soi_config.files.css,
        jss = soi_config.files.js,
        img = soi_config.files.img;

    if (img && img.length > 0) {
        ProcesssorFactory
            .getInstance('image', soi_config)
            .traverse();
    }

    if (css && css.length > 0) {
        traverseCss(css);
    }

    if (jss && jss.length > 0) {
        ProcesssorFactory
            .getInstance('js', soi_config)
            .traverse();
    }
}


// process all relative paths
function processConfigOptions() {
    ['dist_dir', 'module_loader', 'output_file', 'output_base'].forEach(function(item) {
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

    // todo CMD LINE

    // step 1 normalize all config paths
    processConfigOptions();

    // step2 resolve all assets and create resources
    parseFilesOptions();

    // step3 combo and compress css files
    resolveCss();

    // step4 combo and compress js files
    resolveJs();

}


// export
exports.config = function(target) {
    utils.extend(soi_config, target);
};
exports.run = go;