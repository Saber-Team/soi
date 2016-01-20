/**
 * @file 纪录编译周期内时间消耗
 * @author AceMood
 * @email zmike86@gmail.com
 *
 * Usage:
 *   var profiler = require('./profiler');
 *   profiler.record('task1:start');
 *   // some code
 *   profiler.record('task1:end');
 *   profiler:log();
 */

'use strict';

/**
 * 一个能高效寻找给定资源的数据结构.
 * @constructor
 */
function Trie() {
  this.root = { paths: {} };
}

/**
 * @param {Array.<string>} tokens
 * @param {number} value
 */
Trie.prototype.index = function(tokens, value) {
  tokens.forEach(function(token) {
    // 分解路径
    var parts = token.split(sep);
    var node = this.root;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      node.paths[part] = node.paths[part] || { paths: {} };
      node = node.paths[part];
    }
    node.value = value;
  }, this);
};

/**
 * 根据资源路径找到对应的configuration对象
 * @param {string} token
 * @returns {number}
 */
Trie.prototype.find = function(token) {
  var parts = token.split(sep);
  var node = this.root;
  var t = 0;
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    if (node.paths[part]) {
      node = node.paths[part];
      t = node.value;
    } else {
      break;
    }
  }
  return t;
};

var sep = exports.sep = ':';
var trie = new Trie();

exports.record = function(token, tree) {
  var cur = tree || trie;
  var t = Date.now();
  cur.index([token], t);
};

exports.log = function(tokenStart, tokenEnd, tree) {
  var cur = tree || trie;
  var t0 = cur.find(tokenStart);
  var t1 = cur.find(tokenEnd);

  soi.log.info('From ' + tokenStart + ' => ' + tokenEnd
      +' consume ' + (t1 - t0) + ' ms.');
};