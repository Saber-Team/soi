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
            let distPath = node_path.resolve(node_path.join(task.options.dir, pathname));
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
                let distPath = node_path.resolve(node_path.join(task.options.dir, pathname));
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
        let allRes = soi.util.shimMap(map);
        soi.util.writeFile(
            node_path.resolve(node_path.join(task.options.mapTo, 'resource.json')),
            JSON.stringify(allRes.resources, null, 4),
            {
                encoding: 'utf8'
            },
            (err, msg) => {
                if (err) {
                    soi.log.error(`Write resource.json failed, ${err.message}`);
                    return;
                }
                soi.log.fine(`Write resource.json success, ${msg}`);
            }
        );

        // 写打包配置文件
        soi.util.writeFile(
            node_path.resolve(node_path.join(task.options.mapTo, 'packages.json')),
            JSON.stringify(allRes.packages, null, 4),
            {
                encoding: 'utf8'
            },
            (err, msg) => {
                if (err) {
                    soi.log.error(`Write package.json failed, ${err.message}`);
                    return;
                }
                soi.log.fine(`Write package.json success, ${msg}`);
            }
        );
    }
}

module.exports = ReleaseTask;