/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file deploy task
 * @author XCB, AceMood
 */

'use strict';

const node_path = require('path');
const node_url  = require('url');
const Workflow  = require('./Workflow');
const fs        = require('fs');

class DeployTask extends Workflow {
  constructor(name, options) {
    super(name, options);
  }

  flushInternal() {
    let task = this;
    let map = task.getMap();
    let endpoint = task.options.receiver;

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

    // 上传资源表文件
    let allRes = soi.util.shimMap(map);
    soi.log.info(`Sending: [resource.json] ===> [${mapPath}]`);
    soi.util.upload(
      endpoint,
      {
        to: node_path.join(task.options.dir, task.options.mapTo, 'resource.json')
      },
      JSON.stringify(allRes.resources, null, 4),
      'resource.json',
      (err, msg) => {
        if (err) {
          soi.log.error(`Upload [resource.json], [${err.message}]`);
          return;
        }
        soi.log.fine(`Upload [resource.json] success: [${msg}]`);
      }
    );

    // 上传打包配置文件
    soi.log.info(`Sending: [resource.json] ===> [${mapJsonPath}]`);
    soi.util.upload(
      endpoint,
      {
        to: node_path.join(task.options.dir, task.options.mapTo, 'packages.json')
      },
      JSON.stringify(allRes.packages, null, 4),
      'packages.json',
      (err, msg) => {
        if (err) {
          soi.log.error(`Upload [packages.json], [${err.message}]`);
          return;
        }
        soi.log.fine(`Upload [packages.json] success: [${msg}]`);
      }
    );

    !this.watching && this.watchFile();
  }

  watchFile() {
    let task = this;
    this.watching = true;

    let needWatch = task.options.watch;
    let watchDirs = task.options.scandirs;
    let fsTimeout = null;

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
            task.run();
            fsTimeout = setTimeout(() => { fsTimeout = null }, 5000);
          }
        });
      });
    }
  }
}

module.exports = DeployTask;