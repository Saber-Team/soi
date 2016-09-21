/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file compiler for css file
 * @author AceMood
 */

'use strict';

const node_path      = require('path');
const imgcompiler    = require('./img');
const cssUrlRe       = /\burl\((?:(?:"|')?)(?:\s*)([^\)"']*)(?:\s*)(?:(?:"|')?)\)(?:\s*)/g;
const querystringRe  = /\?([^#]*)/g;
const hashRe         = /#(.*)$/g;

// comments
const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const extensionRe    = /\.[^.]*$/;

/**
 * Put compiler back to soi. Apart from `neo-core` make this easy to
 * debug when develop and publish.
 * Plug-in architecture realize through event emitter. As we do not
 * plan to support `async-event-listener` in the future. Current mechanism
 * of node.js event emitter architecture is useful for us.
 * During compiling, an `isCompiled` property will be added to the resource
 * to avoid duplicated compilation.
 *
 * @param {CSS} resource css resource
 * @param {ResourceMap} map resource map object
 * @param {!object} rule contains pattern and to
 * @param {EventEmitter} emitter
 */
const exec = exports.exec = function(resource, map, rule, emitter) {
    if (resource.isCompiled) {
        return;
    }

    emitter.emit('pre-compile-resource', resource);

    if (!resource.isPermanent) {
        let content = resource.getContent();
        if (!emitter.options.preserveComments) {
            content = content
                .replace(blockCommentRe, '');
        }
        content = content
            .replace(cssUrlRe, function($0, $1) {
                if (soi.util.isAbsUrl($1)) {
                    return $0;
                }

                let path = $1;
                let inline = false;

                let m = $1.match(querystringRe);
                if (m && (m[0].replace(/^\?/, '') === '__inline')) {
                    path = $1.replace(hashRe, '').replace(querystringRe, '');
                    inline = true;
                }

                path = node_path.join(node_path.dirname(resource.path), path);
                let inlineResource = map.getResourceByPath(path);

                if (inlineResource) {
                    if (!inlineResource.isCompiled) {
                        let to = '';
                        let hit = emitter.rules.match(inlineResource.path);
                        if (hit) {
                            to = hit.to;
                            if (typeof to !== 'string') {
                                soi.log.error('rule\'s to property must be string.');
                                throw new Error('the path ' + to +' must be string');
                            }
                        }
                        imgcompiler.exec(inlineResource, map, hit, emitter);
                    }
                    return $0.replace($1,
                        inline ? inlineResource.getDataUri() : inlineResource.uri);
                } else {
                    soi.log.warn('Image [' + path + '] in file [' +
                        resource.path + '] Not found');
                }

                return $0;
            });

        resource.setContent(content);
    }

    emitter.emit('compiled-resource', resource);
    resource.isCompiled = true;
    emitter.emit('pre-resolve-resource', resource);

    if (rule.pattern && rule.to) {
        let to = rule.to;
        let pathObj = node_path.parse(to);
        if (!pathObj.ext) {
            to = (soi.util.isDirPath(to) ? to : to + node_path.sep)
                + node_path.basename(resource.path);
        }

        resource.uri = resource.path.replace(rule._reg, to);
    } else {
        resource.uri = resource.path;
    }
    resource.uri = resource.uri.replace(extensionRe, '.css');

    // complete resolve
    emitter.emit('resolved-resource', resource);
};