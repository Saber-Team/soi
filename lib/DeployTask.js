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
 * @file deploy task
 * @author XCB
 */

'use strict';

var node_path =require('path');
var Task = require('./Task');

class DeployTask extends Task {
  constructor(name, options, soiOptions, args, map) {
    super(name, options, soiOptions, args, map);
  }

  flushInternal() {
    var task = this;
    var url = task.options.receiver;

    // 写文件
    soi.util.map(task.map.resourcePathMap, function(key, resource) {
      var distPath = node_path.join(task.options.dir, resource.uri);
      soi.log.info('Sending: [' + resource.path + '] ===> [' + distPath + ']');
      soi.util.upload(
        url,
        {to: distPath},
        resource.getContent(),
        node_path.basename(resource.path),
        function(err, msg) {
          if (err) {
            soi.log.error('upload [' + resource.path + '] error: [' + err + ']');
            return ;
          }
          soi.log.fine('upload [' + resource.path + '] success: [' + msg + ']');
        }
      );
    });

    // 写map.json
    var mapJsonPath = node_path.join(task.options.dir, task.options.mapTo);
    soi.log.info('Sending: [map.json] ===> [' + mapJsonPath + ']');
    soi.util.upload(
      url,
      {to: mapJsonPath},
      soi.util.shimMap(task.map),
      node_path.basename(mapJsonPath),
      function(err, msg) {
        if (err) {
          soi.log.error('upload [map.json] error: [' + err + ']');
          return ;
        }
        soi.log.fine('upload [map.json] success: [' + msg + ']');
      }
    )
  }
}

module.exports = DeployTask;