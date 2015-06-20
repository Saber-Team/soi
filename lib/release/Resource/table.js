/**
 * @fileoverview 资源表
 */


'use strict';


var utils = require('../utils');
var ResourceType = require('./type');


/**
 * 所有静态资源的资源表
 * @type {{img: {}, js: {}, css: {}}}
 */
var resources = {
  img   : {},
  js    : {},
  css   : {},
  pkgs  : {
    js  : {},
    css : {}
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
 * @returns {*}
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
 *
 * @param type
 * @param id
 * @returns {*}
 */
function getPackageByPath(type, id) {
  if (!resources.pkgs[type]) {
    return null;
  } else if (!resources.pkgs[type][id]) {
    return null;
  } else {
    return resources.pkgs[type][id];
  }
}


/**
 *
 * @returns {{img: {}, js: {}, css: {}}}
 */
function getAllResources() {
  return resources;
}


var ResourceTable = {
  // update
  updateResource: function(type, id, resource) {
    if (!resources[type]) {
      return false;
    } else if (!resources[type][id]) {
      return false;
    } else {
      resources[type][id] = resource;
      return true;
    }
  },
  // delete
  removeResource: function(type, id) {
    if (!resources[type]) {
      return false;
    } else if (!resources[type][id]) {
      return false;
    } else {
      delete resources[type][id];
      return true;
    }
  },
  // delete all
  clear: function() {
    resources = {
      img : {},
      js  : {},
      css : {},
      swf : {},
      svg : {},
      font: {},
      htc : {},
      pkgs  : {
        js  : {},
        css : {}
      }
    };
  },
  // print resource to a json file
  print: function() {
    var content = JSON.stringify(resources, null, 4);
    var file = soi().ENV.config.optimizer.map_file;
    utils.writeFile(file, content, {
      encoding: soi().ENV.config.optimizer.encoding
    });
  }
};


// 导出
exports.register = register;
exports.registerPackage = registerPackage;
exports.getResource = getResource;
exports.getPackageByPath = getPackageByPath;
