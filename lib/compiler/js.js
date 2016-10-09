/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file compiler for js file
 * @author AceMood
 */

'use strict';

const node_path      = require('path');
const requireRe      = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
const requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;
const builtInRe      = /\b__(inline|uri)\s*\(\s*['"]([^"']+)["']\s*\)/g;
const utils          = require('../util');

// comments
const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const lineCommentRe  = /\/\/.+(\n|$)/g;
const extensionRe    = /\.[^.]*$/;

// replace "'" => "\'"
// replace "\r\n" => "\\n"
const replacer = function(str) {
    return str
        .replace(/\'/g, '\\\'')
        .replace(/\n|\r|\r\n/g, '\\n');
};

const compile = function(resource, map, emitter) {
    if (!resource.isCompiled) {
        let hit = emitter.rules.match(resource.path);
        if (!hit) {
            soi.log.error(
                'No rules match the given path: [' + resource.path + '].'
            );
            throw new Error('No rules match the given path');
        }

        exec(resource, map, hit, emitter);
    }
};

const fireReferError = function(modulePath, resource) {
    soi.log.error(
        `JS file refer to [${modulePath}] in file [${resource.path}] Not found`
    );
    process.exit(0);
};

/**
 * Put compiler apart from `neo-core` make this easy to
 * debug when develop and publish.
 *
 * Plug-in architecture realize through event emitter. As we do not
 * plan to support `async-event-listener` in the future. Current mechanism
 * of node.js event emitter architecture is useful for us.
 * During compiling, an `isCompiled` property will be added to the resource
 * to avoid duplicated compilation.
 *
 * @param {JS} resource js resource
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
                .replace(blockCommentRe, '')
                .replace(lineCommentRe, '');
        }
        content = content
            .replace(builtInRe, ($0, $1, $2) => {
                let modulePath = node_path.normalize(
                    node_path.join(node_path.dirname(resource.path), $2)
                );
                let refResource = map.getResourceByPath(modulePath);
                if (refResource) {
                    let compiler = soi.getCompiler(refResource.type);
                    let hit = emitter.rules.match(refResource.path);
                    if (compiler) {
                        compiler.exec(refResource, map, hit, emitter);
                    } else if (typeof refResource.compile === 'function') {
                        refResource.compile(map, hit);
                    }

                    if ('inline' === $1) {
                        return '\'' + replacer(refResource.getContent())  + '\'';
                    }

                    if ('uri' === $1) {
                        return '\'' + refResource.uri + '\'';
                    }

                } else {
                    fireReferError(modulePath, resource);
                }
            })
            .replace(requireRe, ($0, $1) => {
                if (soi.util.isAbsUrl($1)) {
                    return $0;
                }
                // original id may be changed, but getModulePathByOrigin
                // still record the old module's path.
                let modulePath = resource.getModulePathByOrigin($1);
                let inlineResource = map.getResourceByPath(modulePath);

                if (inlineResource) {
                    compile(inlineResource, map, emitter);
                    return $0.replace($1, inlineResource.id);
                } else {
                    fireReferError($1, resource);
                }
            })
            .replace(requireAsyncRe, ($0, $1) => {
                if ($1) {
                    let ret = [];
                    let dependency = $1.split(',');
                    dependency.forEach(dep => {
                        // ` "./ajax"` => `./ajax`
                        dep = dep.trim().replace(/['"]/g, '');
                        if (soi.util.isAbsUrl(dep)) {
                            ret.push('"' + dep + '"');
                            return;
                        }

                        // original id may be changed, but getModulePathByOrigin
                        // still record the old module's path.
                        let originalModuleId = resource.getModulePathByOrigin(dep);
                        let inlineResource = map.getResourceByPath(originalModuleId);

                        if (inlineResource) {
                            // We needn't compile it as there is not a
                            // directly reference.
                            // compile(inlineResource, map, emitter);
                            ret.push('"' + inlineResource.id + '"');
                        } else {
                            fireReferError($1, resource);
                        }
                    });

                    return $0.replace($1, ret.join(','));
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
    resource.uri = resource.uri.replace(extensionRe, '.js');

    // complete resolve
    emitter.emit('resolved-resource', resource);
};
