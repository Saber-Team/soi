/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file release task
 * @author XCB, AceMood
 */

'use strict';

const node_path = require('path');
const node_url  = require('url');
const Workflow  = require('./Workflow');

class ReleaseTask extends Workflow {
  constructor(name, options) {
    super(name, options);
  }

  flushInternal() {
    let task = this;
    let map = task.getMap();

    // 写资源文件
    Object.keys(map.resourcePathMap).forEach(key => {
      let resource = map.resourcePathMap[key];
      if (!resource.getContent().trim()) {
        soi.log.info(`Skip empty file [${resource.path}]`);
        return;
      }

      let pathname = node_url.parse(resource.uri).pathname;
      let distPath = node_path.join(task.options.dir, pathname);
      soi.log.info(`Flushing: [${resource.path}] ===> [${distPath}]`);

      resource.flush(distPath, err => {
        if (err) {
          soi.log.error(`Flush, [${err.message}]`);
          return ;
        }
        soi.log.fine(`Flush success, [Saved: ${distPath}]`);
      });
    });

    // 写合并打包文件
    if (map.pkgs) {
      let pkgs = map.pkgs;
      Object.keys(pkgs).forEach(pkgId => {
        let pathname = node_url.parse(pkgs[pkgId].uri).pathname;
        let distPath = node_path.join(task.options.dir, pathname);
        soi.log.info(`Flushing: [${pkgId}] ===> [${distPath}]`);

        soi.util.writeFile(
          distPath,
          pkgs[pkgId]._fileContent,
          {
            encoding: 'utf8'
          },
          (err, msg) => {
            if (err) {
              soi.log.error(`Write ${pkgId}, ${err.message}`);
              return;
            }
            soi.log.fine(`Write ${pkgId} success, ${msg}`);
          }
        );
      });
    }

    // 写资源表文件
    soi.util.writeFile(
      task.options.mapTo,
      soi.util.shimMap(map),
      {
        encoding: 'utf8'
      },
      (err, msg) => {
        if (err) {
          soi.log.error(`Write resource.json, ${err.message}`);
          return;
        }
        soi.log.fine(`Write resource.json success, ${msg}`);
      }
    );
  }
}

module.exports = ReleaseTask;