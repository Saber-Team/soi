/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file Task基类, 表示整个编译工作流的执行, 其中[#run]方法为入口
 * @author AceMood, XCB
 */

'use strict';

const os            = require('os');
const node_url      = require('url');
const EventEmitter  = require('events').EventEmitter;
const Neo           = require('neo-core');
const PluginMap     = require('./PluginMap');
const RuleMap       = require('./RuleMap');
const name2plugin   = require('./name2plugin');
const profiler      = require('./profiler');

class Task extends EventEmitter {
  /**
   * 扫描器后的工作流任务
   * @param {string}    name 任务名称
   * @param {?object=}  options 任务配置对象
   */
  constructor(name, options) {
    super();

    this.name = name;
    this.rules = new RuleMap();
    this.plugins = new PluginMap();
    this.options = options || {};
    // 存储缓存数据的key
    this.cachedKey = this.options.cachedKey || '.cache';

    // 以下为公共API, 不可改变
    soi.util.seal(this, [
      'addRule', 'use', 'run', 'setArgs', 'setMap',
      'applyPlugin', 'config', 'mergeRule', 'pack'
    ]);
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
   * @returns {Task}
   */
  setArgs(params) {
    this.args = params;
    return this;
  }

  /**
   * 设置map资源表相关
   * @param {ResourceMap} map
   * @returns {Task}
   */
  setMap(map) {
    this.map = map;
    return this;
  }

  /**
   * 获取map资源表相关
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
      options.to = '/static/res/';
    }

    // 配置了全局域名
    if (this.options.domain) {
      options.to = node_url.resolve(this.options.domain, options.to);
    }

    this.rules.add(pattern, options);
    return this;
  }

  /**
   * 记录要使用的服务插件
   * @param {string} plug
   * @param {?object} options
   * @return {Task}
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
   * 工作流执行
   */
  run() {
    let task = this;

    // 扫描工程目录生成资源表
    task.scan(map => {
      task.emit('scanned', map);
      // 设置资源表, 合并soi全局规则和当前task规则
      task.setMap(map).mergeRule();
      // 预处理
      task.preProcess(() => {
        task.emit('preProcessed', task);
        // 编译资源
        task.compile(() => {
          task.emit('compiled', task);
          // 合并打包
          task.pack(() => {
            task.emit('packed', task);
            // 后处理
            task.postProcess(() => {
              task.emit('postProcessed', task);
              // 写文件
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

    // 遍历资源表进行编译
    map.getAllResources().forEach(resource => {
      if (resource.getContent()) {
        soi.log.info(`Compile file [${resource.path}]`);

        let to = '';
        let hitOptions = task.rules.match(resource.path);
        if (hitOptions) {
          to = hitOptions.to;
          if (typeof to !== 'string') {
            soi.log.error('rule\'s to property must be string.');
            throw new Error('the path ' + to +' must be string');
          }
        }

        let compiler = soi.getCompiler(resource.type);
        if (compiler) {
          compiler.exec(resource, task.map, hitOptions, task);
        } else if (typeof resource.compile === 'function') {
          resource.compile(task.map, hitOptions);
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
        let queue = [];
        let pkgId = 'p' + counter();

        packOptions[pkgPath].forEach(pattern => {
          resources.forEach(resource => {
            let _ = soi.util.normalize(pattern);
            if (_.test(resource.path)) {
              // todo only js and css supported
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
            uri = node_url.resolve(task.options.domain, pkgPath);
          } else {
            uri = pkgPath;
          }
          map.pkgs[pkgId] = {
            uri: uri,
            has: queue.map(resource => resource.id),
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

module.exports = Task;

/**
 * 插入打包的队列结构
 * @param {Array} queue
 * @param {Resource} resource
 */
function insertQueue(queue, resource) {
  let len = queue.length;
  let curResource;
  let insertPosition = 0;
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