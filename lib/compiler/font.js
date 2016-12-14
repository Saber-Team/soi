/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file compiler for font file
 * @author AceMood
 */

'use strict';

const node_path = require('path');

/**
 * Put compiler back to soi. Apart from `neo-core` make this easy to
 * debug when develop and publish.
 * Plug-in architecture realize through event emitter. As we do not
 * plan to support `async-event-listener` in the future. Current mechanism
 * of node.js event emitter architecture is useful for us.
 * During compiling, an `isCompiled` property will be added to the resource
 * to avoid duplicated compilation.
 *
 * @param {Font} resource font resource
 * @param {ResourceMap} map resource map object
 * @param {!object} rule contains pattern and to
 * @param {EventEmitter} emitter
 */
const exec = exports.exec = function(resource, map, rule, emitter) {
    if (resource.isCompiled || resource.isPermanent) {
        return;
    }

    emitter.emit('pre-compile-resource', resource);
    emitter.emit('compiled-resource', resource);
    resource.isCompiled = true;

    // resolve uri of current file
    emitter.emit('pre-resolve-resource', resource);

    if (rule.pattern && rule.to) {
        let to = rule.to;
        // may string pattern or function
        if (typeof to === 'string') {
            let pathObj = node_path.parse(to);
            if (!pathObj.ext) {
                to = (soi.util.isDirPath(to) ? to : to + node_path.sep)
                    + node_path.basename(resource.path);
            }
        }

        resource.uri = resource.path.replace(rule._reg, to);
    } else {
        resource.uri = resource.path;
    }

    // complete resolve
    emitter.emit('resolved-resource', resource);
};