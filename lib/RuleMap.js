/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file 规则Map
 * @author XCB AceMood
 */

'use strict';

var node_path = require('path');

class RuleMap extends Map {
  constructor() {
    super();
  }

  /**
   * 合并两个规则集
   * @param {RuleMap} ruleMap
   */
  merge(ruleMap) {
    if (ruleMap instanceof RuleMap) {
      var keys = ruleMap.keys();
      for (var key of keys) {
        this.set(key, ruleMap.get(key));
      }
    } else {
      throw new Error('invalid params');
    }
  }

  /**
   * 添加规则
   * @param {string|RegExp} pattern 规则模式
   * @param {?object} options
   */
  add(pattern, options) {
    options._ = soi.util.normalize(pattern);
    this.set(pattern, options);
  }

  /**
   * 计算资源匹配的规则集
   * @param {string} path
   * @returns {?string}
   */
  match(path) {
    var matchRule = [];
    this.forEach((options, pattern) => {
      if (options._.test(path)) {
        matchRule.push(pattern);
      }
    });

    return matchRule.length ? matchRule.pop() : null;
  }
}

module.exports = RuleMap;