/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file Task base class, entry from [#run].
 * @author AceMood, XCB
 */

'use strict';

const os            = require('os');
const EventEmitter  = require('events').EventEmitter;
const Neo           = require('neo-core');
const PluginMap     = require('./PluginMap');
const RuleMap       = require('./RuleMap');
const name2plugin   = require('./name2plugin');
const profiler      = require('./profiler');
const utils         = require('./util');

class Workflow extends EventEmitter {
    /**
     * @param {string}    name Name of task.
     * @param {?object=}  options Configuration object
     */
    constructor(name, options) {
        super();

        this.name = name;
        this.rules = new RuleMap();
        this.plugins = new PluginMap();
        this.options = options || {};
        // 存储缓存数据的key
        this.cachedKey = this.options.cachedKey || '.cache';

        // Immutable public api.
        soi.util.seal(this, [
            'addRule', 'use', 'run', 'setArgs', 'setMap',
            'applyPlugin', 'config', 'mergeRule', 'pack'
        ]);

        // Add a default dist path so that each resource has a
        // place to live.
        this.addRule('**', {to: utils.Default_Res_Dist});
    }

    /** 合并soi共用规则和当前task的规则 */
    mergeRule() {
        this.rules.merge(soi.rules);
        return this;
    }

    /** 应用插件 */
    applyPlugin() {
        this.plugins.forEach(pluginName => {
            let plug = '';
            let Plug = '';
            if (!name2plugin[pluginName]) {
                try {
                    Plug = require(pluginName);
                    plug = new Plug(this.plugins._map[pluginName]);
                    plug.init(this);
                } catch (err) {
                    soi.log.error(
                        `require plugin [${pluginName}] Exception: [${err.message}]`);
                }
            } else {
                Plug = require(name2plugin[pluginName]);
                plug = new Plug(this.plugins._map[pluginName]);
                plug.init(this);
            }
        });
        return this;
    }

    /**
     * 设置命令行相关参数
     * @param {object} params
     * @returns {Workflow}
     */
    setArgs(params) {
        this.args = params;
        return this;
    }

    /**
     * Set initial resource map
     * @param {ResourceMap} map
     * @returns {Workflow}
     */
    setMap(map) {
        this.map = map;
        return this;
    }

    /**
     * Get resource map
     * @returns {ResourceMap} map
     */
    getMap() {
        return this.map;
    }

    /**
     * 添加规则
     * @param {string|RegExp} pattern
     * @param {object} options
     */
    addRule(pattern, options) {
        // 没有配置线上路径默认设置为: '/static/res/'
        if (!options.to) {
            options.to = utils.Default_Res_Dist;
        }

        // config cdn domain
        if (this.options.domain && (typeof options.to === 'string')) {
            options.to = utils.normalizeUrl(this.options.domain, options.to);
        }

        this.rules.add(pattern, options);
        return this;
    }

    /**
     * 记录要使用的服务插件
     * @param {string} plug
     * @param {?object} options
     * @return {Workflow}
     */
    use(plug, options) {
        this.plugins.add(plug, options);
        return this;
    }

    /**
     * AOP的插件实现
     * @param {string} methodName
     * @param {function} injector
     */
    onBeforeMethod(methodName, injector) {
        let oldMethod = this[methodName];
        if (typeof oldMethod !== 'function') {
            soi.log.error(`Can't inject task method [${methodName}]`);
            process.exit(0);
        }

        this[methodName] = function() {
            injector.apply(this, arguments);
            oldMethod.apply(this, arguments);
        }.bind(this);
    }

    /**
     * AOP的插件实现
     * @param {string} methodName
     * @param {function} injector
     */
    onAfterMethod(methodName, injector) {
        let oldMethod = this[methodName];
        if (typeof oldMethod !== 'function') {
            soi.log.error(`Can't inject task method [${methodName}]`);
            process.exit(0);
        }

        this[methodName] = function() {
            oldMethod.apply(this, arguments);
            injector.apply(this, arguments);
        }.bind(this);
    }

    /**
     * #run
     */
    run() {
        let task = this;

        // scan work directory
        task.scan(map => {
            task.emit('scanned', map);
            // set resource map, merge global rules and current task rules
            task.setMap(map).mergeRule();
            // pre-process
            task.preProcess(() => {
                task.emit('preProcessed', task);
                // compile
                task.compile(() => {
                    task.emit('compiled', task);
                    // package
                    task.pack(() => {
                        task.emit('packed', task);
                        // post-process
                        task.postProcess(() => {
                            task.emit('postProcessed', task);
                            // write disk file
                            task.flush(() => {
                                task.emit('flushed', task);
                                task.emit('complete', task);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * 执行预处理任务
     */
    preProcess(callback) {
        process.nextTick(callback.bind(this));
    }

    /**
     * 扫描工程目录
     */
    scan(callback) {
        let task = this;
        let loaders = task.options.loaders || [];
        task.options.logger = soi.log;
        let neo = new Neo(
            loaders,
            task.options.scandirs,
            task.options
        );

        profiler.record('scan:start');
        neo.update(task.cachedKey, map => {
            profiler.record('scan:end');
            profiler.log('scan:start', 'scan:end');

            process.nextTick(callback.bind(task, map));
        }, {
            forceRescan: soi.config.get('forceRescan')
        });
    }

    /**
     * 资源维度递归编译
     * @param {function} callback
     */
    compile(callback) {
        let task = this;
        let map = this.getMap();

        map.getAllResources().forEach(resource => {
            if (resource.getContent()) {
                soi.log.info(`Compile file [${resource.path}]`);

                let hit = task.rules.match(resource.path);
                if (!hit) {
                    soi.log.error(
                        'No rules match the given path: [' + resource.path + '].'
                    );
                    throw new Error('No rules match the given path');
                }

                let compiler = soi.getCompiler(resource.type);
                if (compiler) {
                    compiler.exec(resource, task.map, hit, task);
                } else if (typeof resource.compile === 'function') {
                    resource.compile(task.map, hit);
                }
            }
        });

        process.nextTick(callback.bind(task));
    }

    /**
     * 合并文件
     * @param {function} callback
     */
    pack(callback) {
        let task = this;
        let map = task.map;
        let resources = map.getAllResources();

        function pkgIdCounter() {
            let counter = 0;
            return () => { return counter++; };
        }

        let packOptions = task.options.pack;
        let counter = pkgIdCounter();

        // 为资源表加一个pkgs的属性保存打包信息
        map.pkgs = {};
        if (packOptions) {
            Object.keys(packOptions).forEach(pkgPath => {
                let type = /\.css$/.test(pkgPath) ? 'css' : 'js';
                let queue = [];
                let pkgId = 'p' + counter();

                packOptions[pkgPath].forEach(pattern => {
                    resources.forEach(resource => {
                        let _ = soi.util.normalize(pattern);
                        if (_.test(resource.path)) {
                            // only js and css supported
                            insertQueue(queue, resource);
                            resource.within = resource.within ? resource.within.push(pkgId) : [pkgId];
                        }
                    });
                });

                if (queue.length) {
                    let contentAll = '';
                    queue.forEach(resource => {
                        contentAll += resource.getContent() + os.EOL;
                    });

                    let uri;
                    if (task.options.domain) {
                        uri = utils.normalizeUrl(task.options.domain, pkgPath);
                    } else {
                        uri = pkgPath;
                    }
                    map.pkgs[pkgId] = {
                        uri: uri,
                        has: queue.map(resource => resource.id),
                        type: type,
                        _fileContent: contentAll
                    }
                }
            });
        }

        process.nextTick(callback.bind(task));
    }

    /**
     * 编译后处理
     * @param {function} callback
     */
    postProcess(callback) {
        process.nextTick(callback.bind(this));
    }

    /**
     * 将文件写入
     * @param {function} callback
     */
    flush(callback) {
        this.flushInternal(callback);
    }

    flushInternal(callback) {
        process.nextTick(callback.bind(this));
    }
}

module.exports = Workflow;

/**
 * 插入打包的队列结构
 * @param {Array} queue
 * @param {Resource} resource
 */
function insertQueue(queue, resource) {
    let len = queue.length;
    let curResource;
    let insertPosition = queue.length;
    let requires;
    let attr;

    if (resource.type === 'js') {
        requires = resource.requiredModules;
        attr = 'requiredModules';
    } else if (resource.type === 'css') {
        attr = 'requiredCSS';
        requires = resource.requiredCSS;
    }

    for (let i = 0; i < len; ++i) {
        curResource = queue[i];
        // 遇到资源依赖项
        if (requires.indexOf(curResource.id) > -1) {
            insertPosition = i + 1;
            continue;
        }
        // 遇到依赖资源项
        if (curResource[attr].indexOf(resource.id) > -1) {
            insertPosition = i;
            break;
        }
    }

    queue.splice(insertPosition, 0, resource);
}
