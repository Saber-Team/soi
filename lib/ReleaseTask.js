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

        // calculate and store the local SR directory in map object
        // for `Filesystem::rendFile` later.
        map.root = node_path.resolve(task.options.dir);

        // write single resource to disk
        Object.keys(map.resourcePathMap).forEach(key => {
            let resource = map.resourcePathMap[key];
            if (!resource.getContent().trim()) {
                soi.log.info(`Skip empty file: ${resource.path}.`);
                return;
            }

            let pathname;
            if (task.options.domain) {
                pathname = node_url.parse(resource.uri.replace(
                    task.options.domain,
                    ''
                )).pathname;
            } else {
                pathname = node_url.parse(resource.uri).pathname;
            }

            let distPath = node_path.resolve(node_path.join(task.options.dir, pathname));
            soi.log.info(`Flushing: ${resource.path} ===> ${distPath}`);

            // calculate and store the local SR path for `Filesystem::rendFile` later.
            resource.localPathName = pathname;
            resource.flush(distPath, err => {
                if (err) {
                    soi.log.error(`Write file failed, ${err.message}`);
                    return ;
                }
                soi.log.fine(`Flush success, Saved: ${distPath}`);
            });
        });

        // write package files to disk
        if (map.pkgs) {
            let pkgs = map.pkgs;
            Object.keys(pkgs).forEach(pkgId => {
                let pathname;
                if (task.options.domain) {
                    pathname = node_url.parse(pkgs[pkgId].uri.replace(
                        task.options.domain,
                        ''
                    )).pathname;
                } else {
                    pathname = node_url.parse(pkgs[pkgId].uri).pathname;
                }

                let distPath = node_path.resolve(node_path.join(task.options.dir, pathname));
                soi.log.info(`Flushing: ${pkgId} ===> ${distPath}`);

                // calculate and store the local SR path for `Filesystem::rendFile` later.
                pkgs[pkgId].localPathName = pathname;
                soi.util.writeFile(
                    distPath,
                    pkgs[pkgId]._fileContent,
                    {
                        encoding: 'utf8'
                    },
                    (err, msg) => {
                        if (err) {
                            soi.log.error(`Write ${pkgId} failed, ${err.message}`);
                            return;
                        }
                        soi.log.fine(`Write ${pkgId} success, ${msg}`);
                    }
                );
            });
        }

        // write resource.json to disk
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

        // write packages.json to disk
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