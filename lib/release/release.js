/**
 * @fileoverview release对应`soi release [task]`命令，完成本地的打包构建产出资源表。
 *
 */

// system modules
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

// custom modules
var Processsor = require('./Processor/factory');
//var ResolverFactory = require('./resolver/factory');

var OPTIONS;
var defaultOption = {
  domain: '/',
  obscure: true
};
// 配置对象
var configObject;


/**
 * 处理图片等纯静态资源
 * @param {Array} pack
 */
function processStaticBundles(pack) {
  pack.forEach(function(pkg) {
    var files = pkg.files;
    if (!files || !soi.utils.isArray(files)) {
      console.log(chalk.bgRed.bold(
          'Can\'t parse static pack without files field or files isn\'t an array.'
      ));
      process.exit(1);
    }

    // 标准化dist属性
    pkg.dist = soi.utils.normalizeSysPath(
        path.join(OPTIONS.distRootDir, pkg.dist));

    soi.fs.mkdir(pkg.dist);
  });
}


/**
 * Deal with js css dynamic resource and so on.
 * @param {Array} bundles
 */
function processDynamicBundles(bundles) {
  bundles.forEach(function(pkg) {
    if (pkg.input) {
      pkg.input = soi.utils.normalizeSysPath(
          path.resolve(OPTIONS.base_dir, pkg.input));
      // ignore files field
      pkg.files = null;
    } else if (!pkg.files) {
      console.log(chalk.bgRed.bold(
          'Can\'t parse static bundles without input & files field. \n'
      ));
      process.exit(1);
    }
    pkg.defer = pkg.defer || false;
    pkg.dist_dir = soi.utils.normalizeSysPath(pkg.dist_dir ?
        path.resolve(OPTIONS.base_dir, pkg.dist_dir) + '/' :
        OPTIONS.dist_dir);

    soi.utils.mkdir(pkg.dist_dir);
  });
}


/**
 * 标准化release任务中的一些路径
 */
function processConfigOptions() {
//  // 标准化virtualRootDir属性
//  var vrd = OPTIONS.virtualRootDir;
//  if (vrd === 'cwd' || vrd === './' || vrd === '/') {
//    OPTIONS.virtualRootDir = soi.utils.normalizeSysPath(process.cwd() + '/');
//  } else {
//    OPTIONS.virtualRootDir = soi.utils.normalizeSysPath(
//            path.resolve(process.cwd() + '/', vrd) + '/');
//  }
//
//  // 标准化distRootDir属性
//  var drd = OPTIONS.distRootDir;
//  if (drd === 'cwd' || drd === './' || drd === '/') {
//    OPTIONS.distRootDir = soi.utils.normalizeSysPath(process.cwd() + '/');
//  } else {
//    OPTIONS.distRootDir = soi.utils.normalizeSysPath(
//            path.resolve(process.cwd() + '/', drd) + '/');
//  }
//
//  // 标准化mapTo属性
//  var mapTo = OPTIONS.mapTo;
//  OPTIONS.mapTo = soi.utils.normalizeSysPath(
//        path.resolve(process.cwd() + '/', mapTo));


  // newly added
  if (OPTIONS.pack.img) {
    processStaticBundles(OPTIONS.pack.img);
  }

  if (OPTIONS.pack.css) {
    processDynamicBundles(OPTIONS.pack.css);
  }

  if (OPTIONS.pack.js) {
    processDynamicBundles(OPTIONS.pack.js);
  }
}


// resolve relative path in js/css file
// and concatenate them
// at last compress them
function resolveFiles() {
  ResolverFactory.getInstance('css').resolve();
  ResolverFactory.getInstance('js').resolve();
}


/**
 * 创建资源
 */
function createResource() {
  Processsor.getInstance('img').traverse(OPTIONS);
  //Processsor.getInstance('css').traverse(OPTIONS);
  //Processsor.getInstance('js').traverse(OPTIONS);
}


/**
 * 构建
 * @param {String} task 要构建的任务名称
 */
function release(task) {
  if (!soi().ENV.config.release || !soi().ENV.config.release[task]) {
    soi.log.error('Try to release task: ' + task + ' do not exists.');
    process.exit(1);
  }
  var conf = configObject || soi().ENV.config.release[task];
  OPTIONS = Object.create(defaultOption);
  // read user-defined config and mixin default options
  soi.utils.extend(OPTIONS, conf || {});

  // step 1 标准化vrd等配置路径
  processConfigOptions();

  // step2 记录在资源表并且生成文件
  createResource();

  // step3 combo and compress js & css files
  //resolveFiles();
}


// clear refs
release.reset = function() {
  require('./resource/table').clear();
  require('./module/manager').clear();
};


/**
 * 设置配置对象
 * @param {Object} obj
 */
function config(obj) {
  configObject = obj;
}


exports.release = release;
exports.config = config;