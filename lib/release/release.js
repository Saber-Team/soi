/**
 * @fileoverview release对应`soi release [taskName]`命令，
 *     完成本地的打包构建产出资源表。
 * @email zmike86@gmail.com
 */

'use strict';

// imported modules
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var Processsor = require('./processor/factory');
var ResourceTable = require('./resource/ResourceTable');


var OPTIONS;
var defaultOption = {
  domain: '/',
  obscure: true
};
// 配置对象
var configObject;


/**
 * 处理release节点下一些可继承属性，扩展默认配置对象
 * @param {String} task
 */
function inheritProps (task) {
  var releaseNode = soi().ENV.config.release;

  if (!releaseNode || !releaseNode[task]) {
    soi.log.error('Try to release task: ' + task + ' do not exists.');
    process.exit(1);
  }

  var conf = configObject || releaseNode[task];
  OPTIONS = Object.create(defaultOption);

  ['obscure', 'charset', 'domain', 'virtualRootDir', 'distRootDir', 'mapTo']
      .forEach(function (prop) {
        if (releaseNode[prop] && conf[prop] !== (void 0)) {
          conf[prop] = releaseNode[prop]
        }
      });


  // 将用户配置合并入默认配置
  soi.utils.extend(OPTIONS, conf || {})
}


/**
 * 处理图片等纯静态资源
 * @param {Array} pack
 */
function checkStatic_ (pack) {
  pack.forEach(function (pkg) {
    var files = pkg.files;
    if (!files || !soi.utils.isArray(files)) {
      soi.log.error(
          'Can\'t parse static pack without files field or files isn\'t an array.');
      process.exit(1)
    }
  })
}


/**
 * 处理css & js资源.
 * @param {Array} pack
 */
function checkDynamic_ (pack) {
  pack.forEach(function (pkg) {
    // 模块依赖树入口
    if (pkg.entrance) {
      // ignore files field
      // pkg.files = [];
    } else if (!pkg.files || !soi.utils.isArray(pkg.files)) {
      soi.log.error(
          'Can\'t parse static packs without both entrance & files fields.');
      process.exit(1)
    }
  })
}


/**
 * 检查资源必要字段是否完整
 */
function checkForResource () {
  if (OPTIONS.pack.swf) {
    checkStatic_(OPTIONS.pack.img)
  }

  if (OPTIONS.pack.img) {
    checkStatic_(OPTIONS.pack.img)
  }

  if (OPTIONS.pack.css) {
    checkDynamic_(OPTIONS.pack.css)
  }

  if (OPTIONS.pack.js) {
    checkDynamic_(OPTIONS.pack.js)
  }
}


/**
 * 创建资源
 */
function createResource () {
  Processsor.getInstance('swf').traverse(OPTIONS);
  Processsor.getInstance('img').traverse(OPTIONS);
  Processsor.getInstance('css').traverse(OPTIONS);
  Processsor.getInstance('js').traverse(OPTIONS);
  // 必须最后执行
  Processsor.getInstance('tpl').traverse(OPTIONS);
}


/**
 * 开始主过程构建
 * @param {String} task 要构建的任务名称
 */
function release (task) {
  // step 1 处理release节点下一些可继承属性
  inheritProps(task);

  // step 2 检查资源必要字段是否完整
  checkForResource();

  // step 3 记录在资源表并且生成文件
  createResource();

  // step 4 写入map文件
  var mapPath = path.resolve(OPTIONS.mapTo);
  if (fs.existsSync(mapPath)) {
    rimraf.sync(mapPath)
  }
  ResourceTable.print(mapPath, 'utf8')
}


/** 重置资源表和模块注册器 */
release.reset = function () {
  require('./resource/ResourceTable').reset();
  require('./module/manager').reset();
};


/**
 * 设置配置对象
 * @param {Object} obj
 */
function config (obj) {
  configObject = obj;
}


// 导出
exports.release = release;
exports.config = config;