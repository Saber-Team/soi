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
 * @file compile css file
 * @author AceMood
 */

'use strict';

const node_path = require('path');
const imgcompiler = require('./img');
const cssUrlRe = /\burl\((?:(?:"|')?)(?:\s*)([^\)"']*)(?:\s*)(?:(?:"|')?)\)(?:\s*)/g;
const querystringRe = /\?([^#]*)/g;
const hashRe = /#(.*)$/g;

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
 * @param {CSS} resource css resource
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

  // compile referred image resource recursively
  var content = resource.getContent()
    .replace(blockCommentRe, '')
    .replace(cssUrlRe, function($0, $1) {
      if (soi.util.isAbsUrl($1)) {
        return $0;
      }

      var path = $1;
      var inline = false;

      var m = $1.match(querystringRe);
      if (m && (m[0].replace(/^\?/, '') === '__inline')) {
        path = $1.replace(hashRe, '').replace(querystringRe, '');
        inline = true;
      }

      path = node_path.join(node_path.dirname(resource.path), path);
      var inlineResource = map.getResourceByPath(path);

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
          imgcompiler.exec(inlineResource, map, hitOptions, emitter);
        }
        return $0.replace($1,
          inline ? inlineResource.getDataUri() : inlineResource.uri);
      } else {
        soi.log.warn('Image [' + path + '] in file [' +
          resource.path + '] Not found');
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

  let extRe = /\.less$/;
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
  resource.uri = extRe.test(resource.uri) ?
    resource.uri.replace(extRe, '.css') :
    resource.uri;

  // complete resolve
  emitter.emit('resolved-resource', resource);
};