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
 * @file release task
 * @author XCB
 */

'use strict';

var path =require('path');
var Task = require('./Task');

class ReleaseTask extends Task {
  constructor(name, options, soiOptions, args, map) {
    super(name, options, soiOptions, args, map);
  }

  flushInternal() {
    var task = this;
    var map = task.getMap();
    // 写资源文件
    soi.util.map(map.resourcePathMap, function(key, resource) {
      if (!resource.getContent().trim()) {
        soi.log.info('Skip empty file [' + resource.path + ']');
        return;
      }

      var distPath = path.join(task.options.dir, resource.uri);
      soi.log.info('Flushing: [' + resource.path + '] ===> [' + distPath + ']');

      resource.flush(distPath, function(err) {
        if (err) {
          soi.log.error('flush error: [' + err + ']');
          return ;
        }
        soi.log.fine('flush success: [Saved: ' + distPath + ']');
      });
    });

    // 写合并打包文件
    if (map.pkgs) {
      let pkgs = map.pkgs;
      Object.keys(pkgs).forEach(function(pkgId) {
        var distPath = path.join(task.options.dir, pkgs[pkgId].uri);
        soi.util.writeFile(distPath, pkgs[pkgId]._fileContent, 'utf8', function(err, msg) {
          if (err) {
            soi.log.error('Write ', pkgId ,' error: ' + err);
            return ;
          }
          soi.log.fine('Write ', pkgId, ' success ' + msg);
        });
      });
    }

    // 写资源表文件
    soi.util.writeFile(task.options.mapTo, soi.util.shimMap(map), 'utf8', function(err, msg) {
      if (err) {
        soi.log.error('Write map.json error: ' + err);
        return ;
      }
      soi.log.fine('Write map.json success ' + msg);
    });
  }
}

module.exports = ReleaseTask;