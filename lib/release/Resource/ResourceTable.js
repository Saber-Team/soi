/**
 * @fileoverview 资源表。表中根据类型划分，资源表示连接前后端架构的基础。
 * 每个类型中的每个资源都有其唯一key，是根据vrd生成的，这样不论打包时是哪种操作系统都能保持唯一。
 * 比如，vrd是'./src/'，则下面的资源 ./src/static/img/a.png的key就是 '/static/img/a.png'。
 */


'use strict';


var ResourceType = require('./type');


/**
 * 所有静态资源的资源表
 */
var resources = {
  img: Object.create(null),
  js: Object.create(null),
  css: Object.create(null),
  swf: Object.create(null),
  pkgs: {
    js: Object.create(null),
    css: Object.create(null)
  }
};


/**
 * 往资源表里注册单个资源
 * @param {Object} resource_description
 */
function register(resource_description) {
  var type = resource_description.type;
  if (!resources[type]) {
    resources[type] = {};
  }
  resources[type][resource_description.key] =
      resource_description.value;
}


/**
 * 注册一个依赖资源包，一般是打包后的css和js
 * @param {Object} pkg_description
 */
function registerPackage(pkg_description) {
  var type = pkg_description.type;
  if (!resources.pkgs[type]) {
    resources.pkgs[type] = {};
  }
  resources.pkgs[type][pkg_description.key] =
      pkg_description.value;
}


/**
 * 获取单一资源
 * @param {ResourceType} type
 * @param {String} key
 * @returns {Resource}
 */
function getResource(type, key) {
  if (!resources[type]) {
    return null;
  } else if (!resources[type][key]) {
    return null;
  } else {
    return resources[type][key];
  }
}


/**
 * 获取单一资源, 依赖于系统中的绝对路径
 * @param {ResourceType} type
 * @param {String} path
 * @returns {Resource}
 */
function getResourceByAbsolutePath(type, path) {
  if (!resources[type]) {
    return null;
  } else {
    var rsc = resources[type];
    for (var key in rsc) {
      if (rsc[key].original === path) {
        return rsc[key];
      }
    }
  }

  return null;
}


/**
 * 根据绝对路径得到资源包，绝对路径是虚拟路径下的绝对路径
 * @param {ResourceType} type
 * @param {String} key
 * @returns {*}
 */
function getPackage(type, key) {
  if (!resources.pkgs[type]) {
    return null;
  } else if (!resources.pkgs[type][key]) {
    return null;
  } else {
    return resources.pkgs[type][key];
  }
}


/**
 * 返回整个资源表
 * @returns {{img: {}, js: {}, css: {}}}
 */
function getAllResources() {
  return resources;
}


/**
 * 改资源
 * @param {ResourceType} type
 * @param {String} key
 * @param {Resource} resource
 * @returns {Boolean}
 */
function updateResource(type, key, resource) {
  if (!resources[type]) {
    return false;
  } else if (!resources[type][key]) {
    return false;
  } else {
    resources[type][key] = resource;
    return true;
  }
}


/**
 * 删除资源
 * @param {ResourceType} type
 * @param {String} key
 * @returns {Boolean}
 */
function removeResource(type, key) {
  if (!resources[type]) {
    return false;
  } else if (!resources[type][key]) {
    return false;
  } else {
    delete resources[type][key];
    return true;
  }
}


/**
 * 清空资源表
 */
function reset() {
  resources = {
    img: Object.create(null),
    js: Object.create(null),
    css: Object.create(null),
    swf: Object.create(null),
    pkgs: {
      js: Object.create(null),
      css: Object.create(null)
    }
  };
}


/**
 * 向指定文件打印资源表
 * @param {String} path
 * @param {String} encoding
 */
function print(path, encoding) {
  var content = JSON.stringify(resources, null, 4);
  soi.fs.writeFile(path, content, {
    encoding: encoding
  });
}


// 导出
exports.register = register;
exports.registerPackage = registerPackage;
exports.getResource = getResource;
exports.getResourceByAbsolutePath = getResourceByAbsolutePath;
exports.getPackage = getPackage;
exports.getAllResources = getAllResources;
exports.updateResource = updateResource;
exports.removeResource = removeResource;
exports.reset = reset;
exports.print = print;