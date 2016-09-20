/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file uglifier插件, js压缩, 监听task的`compiled-resource`事件
 * @author AceMood
 */

'use strict';

const UglifyJS = require('uglify-js');

// default uglify config
let defaultOptions = require('./uglifier.json');

class Uglifier {
    constructor(options) {
        options      = options || {};
        this.options = soi.util.merge({}, defaultOptions, options);
        this.ignore  = options.ignore || soi.fn.FALSE;
    }

    init(task) {
        this.host = task;
        this.exec = this.exec.bind(this);
        task.on('compiled-resource', this.exec);
    }

    exec(resource) {
        if ((resource.type === 'js')
            && !this.ignore(resource.path)
            && !resource.isPermanent) {

            let code = resource.getContent();
            let ast;
            try {
                ast = UglifyJS.parse(code);
            } catch (e) {
                soi.log.error(e);
                process.exit(1);
            }

            // compressor needs figure_out_scope too
            ast.figure_out_scope();
            let compressor = UglifyJS.Compressor(this.options);
            ast = ast.transform(compressor);

            // need to figure out scope again so mangler works optimally
            ast.figure_out_scope();
            ast.compute_char_frequency();
            ast.mangle_names();

            // get Ugly code back :)
            // get compressed code
            code = ast.print_to_string();
            resource.setContent(code);
        }
    }

    uninstall() {
        this.host.removeListener('compiled-resource', this.exec);
    }
}

module.exports = Uglifier;