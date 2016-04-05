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
const util = require('../util');
const requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
const requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;

// comments
const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const lineCommentRe = /\/\/.+(\n|$)/g;

/**
 * 将编译的工作从构建工具流中移出来，由每个资源自己做。
 * 插件通过监听资源编译中的事件完成功能扩展。目前还不支持async-event-listener.
 * 编译过程会将资源添加一个isCompiled属性。这个属性会影响到内存缓存策略，
 * 优先考虑支持文件读取的缓存，文件编译的缓存，后续再做打算
 *
 * @param {JS} resource js模块资源
 * @param {ResourceMap} map 资源表对象
 * @param {!object} rule 需要含有pattern和to两个属性
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
      if (util.isAbsUrl($1)) {
        return $0;
      }

      // original id may be changed, but getModuleIDByOrigin
      // still record the old path as module Id.
      var originalModuleId = resource.getModuleIDByOrigin($1);
      var inlineResource = map.getResource('JS', originalModuleId) ||
        map.getResourceByPath(originalModuleId);

      // 未编译
      if (inlineResource) {
        !inlineResource.isCompiled && exec(inlineResource, map, rule, emitter);
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
          if (util.isAbsUrl(dep)) {
            ret.push('"' + dep + '"');
            return;
          }

          // 原始的id可能变化
          var originalModuleId = resource.getModuleIDByOrigin(dep);
          var inlineResource = map.getResource('JS', originalModuleId);

          // 未编译
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
      to = (util.isDirPath(to) ? to : to + '/')
        + node_path.basename(resource.path);
    }

    resource.uri = resource.path.replace(rule.pattern, to);
  } else {
    resource.uri = resource.path;
  }

  // complete resolve
  emitter.emit('resolved-resource', resource);
};
