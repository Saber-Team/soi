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

const node_path =require('path');
const node_url = require('url');
const Task = require('./Task');
const fs = require('fs');

class DeployTask extends Task {
  constructor(name, options) {
    super(name, options);
  }

  flushInternal() {
    var task = this;
    var map = task.getMap();
    var endpoint = task.options.receiver;

    // 上传文件
    Object.keys(map.resourcePathMap).forEach(key => {
      let resource = map.resourcePathMap[key];
      if (resource.uri) {
        let pathname = node_url.parse(resource.uri).pathname;
        let distPath = node_path.join(task.options.dir, pathname);
        soi.log.info(`Sending: [${resource.path}] ===> [${distPath}]`);

        soi.util.upload(
          endpoint,
          {to: distPath},
          resource.getContent(),
          node_path.basename(resource.path),
          (err, msg) => {
            if (err) {
              soi.log.error(`Upload [${resource.path}], [${err.message}]`);
              return;
            }
            soi.log.fine(`Upload [${resource.path}] success: [${msg}]`);
          }
        );
      } else {
        soi.log.warn(`Empty uri ${resource.path}`);
      }
    });

    // 上传打包文件
    if (map.pkgs) {
      let pkgs = map.pkgs;
      Object.keys(pkgs).forEach(pkgId => {
        let pathname = node_url.parse(pkgs[pkgId].uri).pathname;
        let distPath = node_path.join(task.options.dir, pathname);
        soi.log.info(`Sending: [${pkgId}] ===> [${distPath}]`);

        soi.util.upload(
          endpoint,
          {to: distPath},
          pkgs[pkgId]._fileContent,
          node_path.basename(pkgs[pkgId].uri),
          (err, msg) => {
            if (err) {
              soi.log.error(`Upload [${pkgId}], [${err.message}]`);
              return;
            }
            soi.log.fine(`Upload [${pkgId}] success: [${msg}]`);
          }
        );
      });
    }

    // 上传map.json
    var mapJsonPath = node_path.join(task.options.dir, task.options.mapTo);
    soi.log.info(`Sending: [resource.json] ===> [${mapJsonPath}]`);
    soi.util.upload(
      endpoint,
      {to: mapJsonPath},
      soi.util.shimMap(task.map),
      node_path.basename(mapJsonPath),
      (err, msg) => {
        if (err) {
          soi.log.error(`Upload [resource.json], [${err.message}]`);
          return;
        }
        soi.log.fine(`Upload [resource.json] success: [${msg}]`);
      }
    );

    !this.watching && this.watchFile();
  }

  watchFile() {
    var task = this;
    this.watching = true;
    var needWatch = task.options.watch;
    var watchDirs = task.options.scandirs;
    var fsTimeout = null;
    if (needWatch) {
      watchDirs.forEach(dir => {
        dir = node_path.resolve(dir);
        soi.log.info(`watching directory ${dir}`);
        fs.watch(dir, {
          persistent: true,
          recursive: true
        }, (evt, filename) => {
          if (!fsTimeout) {
            soi.log.warn(`${filename} is ${evt}`);
            soi.run('deploy', task.name, task.args.argv);
            fsTimeout = setTimeout(() => { fsTimeout = null }, 5000);
          }
        });
      });
    }
  }
}

module.exports = DeployTask;