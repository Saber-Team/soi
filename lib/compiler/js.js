/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file compile js file
 * @author AceMood
 */

'use strict';

const node_path = require('path');
const requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
const requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;

// comments
const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const lineCommentRe = /\/\/.+(\n|$)/g;

/**
 * Put compiler back to soi. Apart from `neo-core` make this easy to
 * debug when develop and publish.
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
var exec = exports.exec = function(resource, map, rule, emitter) {
  if (resource.isCompiled || resource.isPermanent) {
    return;
  }

  // compile single resource
  emitter.emit('pre-compile-resource', resource);

  // compile referred js resource recursively
  var content = resource.getContent()
    .replace(blockCommentRe, '')
    .replace(lineCommentRe, '')
    .replace(requireRe, ($0, $1) => {
      if (soi.util.isAbsUrl($1)) {
        return $0;
      }

      // original id may be changed, but getModuleIDByOrigin
      // still record the old path as module Id.
      var originalModuleId = resource.getModuleIDByOrigin($1);
      var inlineResource = map.getResource('JS', originalModuleId) ||
        map.getResourceByPath(originalModuleId);

      if (inlineResource) {
        if (!inlineResource.isCompiled) {
          let to = '';
          let hitOptions = emitter.rules.match(inlineResource.path);
          if (hitOptions) {
            to = hitOptions.to;
            if (typeof to !== 'string') {
              soi.log.error('rule\'s to property must be string.');
              throw new Error('the path ' + to +' must be string');
            }
          }

          exec(inlineResource, map, hitOptions, emitter);
        }
        return $0.replace($1, inlineResource.id);
      } else {
        soi.log.warn('JS file refer to [' + $1 + '] in file [' +
          resource.path + '] Not found');
      }

      return $0;
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

          // original id may be changed, but getModuleIDByOrigin
          // still record the old path as module Id.
          var originalModuleId = resource.getModuleIDByOrigin(dep);
          var inlineResource = map.getResource('JS', originalModuleId) ||
            map.getResourceByPath(originalModuleId);

          if (inlineResource) {
            if (!inlineResource.isCompiled) {
              exec(inlineResource, map, rule, emitter);
            }
            ret.push('"' + inlineResource.id + '"');
          } else {
            soi.log.warn('JS file refer to [' + $1 + '] in file [' +
              resource.path + '] Not found');
          }
        });

        return $0.replace($1, ret.join(','));
      }

      return $0;
    });

  // replace content
  resource.setContent(content);

  // complete compile
  emitter.emit('compiled-resource', resource);
  resource.isCompiled = true;

  // resolve uri of current js file
  emitter.emit('pre-resolve-resource', resource);

  if (rule.pattern && rule.to) {
    let to = rule.to;
    let pathObj = node_path.parse(to);
    if (!pathObj.ext) {
      to = (soi.util.isDirPath(to) ? to : to + '/')
        + node_path.basename(resource.path);
    }

    resource.uri = resource.path.replace(rule.pattern, to);
  } else {
    resource.uri = resource.path;
  }

  // complete resolve
  emitter.emit('resolved-resource', resource);
};
