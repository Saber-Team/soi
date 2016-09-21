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
    tokens.forEach(token => {
        // 分解路径
        let parts = token.split(sep);
        let node = this.root;
        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            node.paths[part] = node.paths[part] || { paths: {} };
            node = node.paths[part];
        }
        node.value = value;
    });
};

/**
 * 根据资源路径找到对应的configuration对象
 * @param {string} token
 * @returns {number}
 */
Trie.prototype.find = function(token) {
    let parts = token.split(sep);
    let node = this.root;
    let t = 0;
    for (let i = 0; i < parts.length; i++) {
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

const sep = exports.sep = ':';
const trie = new Trie();

exports.record = function(token, tree) {
    let cur = tree || trie;
    let t = Date.now();
    cur.index([token], t);
};

exports.log = function(tokenStart, tokenEnd, tree) {
    let cur = tree || trie;
    let t0 = cur.find(tokenStart);
    let t1 = cur.find(tokenEnd);

    console.log(`From ${tokenStart} ==> ${tokenEnd} consume ${(t1 - t0)} ms`);
};