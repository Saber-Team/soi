// system modules
var fs = require('fs');
var path = require('path');

// custom modules
var utils = require('./utils');
var ProcesssorFactory = require('./processor/factory');
var ResolverFactory = require('./resolver/factory');


// config file
// todo read from cmd or cwd
var soi_config = require('../soi.conf');


// create all resources
function parseFilesOptions() {
    ProcesssorFactory
        .getInstance('image', soi_config)
        .traverse();

    ProcesssorFactory
        .getInstance('css', soi_config)
        .traverse();

    ProcesssorFactory
        .getInstance('js', soi_config)
        .traverse();
}


// process all relative paths in config file
function processConfigOptions() {
    ['dist_dir', 'module_loader', 'output_file', 'output_base', 'css_entry_point']
        .forEach(function(item) {
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


// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
    ResolverFactory
        .getInstance('css', soi_config)
        .resolve();

    ResolverFactory
        .getInstance('js', soi_config)
        .resolve();
}


function run() {
    // todo CMD LINE

    // step 1 normalize all config paths
    processConfigOptions();

    // step2 resolve all assets and create resources
    parseFilesOptions();

    // step3 combo and compress js & css files
    resolveFiles();

}


// export
exports.config = function(target) {
    utils.extend(soi_config, target);
};
exports.processConfigOptions = processConfigOptions;
exports.parseFilesOptions = parseFilesOptions;
exports.resolveFiles = resolveFiles;
exports.run = run;