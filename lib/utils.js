

'use strict';

var util = require('util');
var fs = require('fs');
var path = require('path');


/**
 * 深度复制对象.
 * @param obj
 * @returns {*}
 */
function deepClone(obj) {
  var clone;
  if (isObject(obj)) {
    clone = {};
    for (var key in obj) {
      clone[key] = deepClone(obj[key]);
    }
  } else if (isArray(obj)) {
    clone = [];
    for (var i = 0; i < obj.length; ++i) {
      clone[i] = deepClone(obj[i]);
    }
  } else {
    clone = obj;
  }
  return clone;
}


/**
 * 混入对象
 * @param {Object} target
 * @param {Object} src
 * @param {Boolean} deep
 */
function extend(target, src, deep) {
  if (!deep) {
    for(var k in src) {
      target[k] = src[k];
    }
  } else {
    if (isObject(src)) {
      for (var key in src) {
        if (isObject(src[key])) {
          target[key] = target[key] || {};
          extend(target[key], src[key], deep);
        } else if (isArray(src[key])) {
          target[key] = target[key] || [];
          extend(target[key], src[key], deep);
        } else {
          target[key] = src[key];
        }
      }
    } else if (isArray(src)) {
      for (var i = 0; i < src.length; ++i) {
        if (isObject(src[i])) {
          target[i] = target[i] || {};
          extend(target[i], src[i], deep);
        } else if (isArray(src[i])) {
          target[i] = target[i] || [];
          extend(target[i], src[i], deep);
        } else {
          target[i] = src[i];
        }
      }
    } else {
      target = src;
    }
  }
}


/**
 * 判断是否数组
 * @param {*} o
 * @returns {Boolean}
 */
function isArray(o) {
  return util.isArray(o);
}


/**
 * 判断是否原生对象
 * @param {*} o
 * @returns {Boolean}
 */
function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}


/**
 * 数组去重
 * @param {Array} arr
 */
function unique(arr) {
  var seen = {},
      cursorInsert = 0,
      cursorRead = 0;

  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = (typeof current).charAt(0) + current;

    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      arr[cursorInsert++] = current;
    }
  }
  arr.length = cursorInsert;
  return arr;
}


/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {String} url
 * @returns {Boolean}
 */
function isAbsUrl(url) {
  return /:\//.test(url) || path.isAbsolute(url);
}


/**
 * 将windows路径中的 `\\` 转化成unix的 `/`;
 * @param {String} p
 * @returns {string}
 */
function normalizeSysPath(p) {
  if (/^http/.test(p)) {
    p.split(/http(?:s)?:\/\//)[1]
  } else {
    return path.normalize(p).replace(/\\/g, '/');
  }
}


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args 要扁平化的各个值.
 * @return {!Array} 返回包含所有值的数组.
 */
function flatten(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (isArray(element)) {
      result.push.apply(result, flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
}


/**
 * Read file content as JSON format.
 * @param {String} path
 * @param {Object} option
 * @returns {*}
 */
function readJSON(path, option) {
  var str = readFile(path, option);
  var ret;
  try {
    ret = JSON.parse(str);
  } catch (err) {

  }
  return ret;
}


// 导出
exports.extend = extend;
exports.deepClone = deepClone;
exports.isArray = util.isArray;
exports.flatten = flatten;
exports.isObject = isObject;
exports.unique = unique;
exports.isAbsUrl = isAbsUrl;
exports.normalizeSysPath = normalizeSysPath;
exports.readJSON = readJSON;