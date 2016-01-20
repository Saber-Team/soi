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
      for (var i = 0, l = keys.length; i < l; i++) {
        this.set(keys[i], ruleMap.get(key[i]));
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
    this.set(pattern, options);
  }

  /**
   * 计算资源匹配的规则集
   * @param {Resource} resource
   * @returns {Array}
   */
  match(resource) {
    var matchRule = [];
    this.keys().forEach(function (pattern) {
      soi.util.normalize(pattern).test(resource) && matchRule.push(pattern);
    });
    return matchRule;
  }

  getUriByPath(p) {
    var keys = this.keys();
    for (let i = keys.length -1; i >= 0; i--) {
      var pattern = keys[i];
      if (soi.util.normalize(pattern).test(p)) {
        var to = parsePath(this.get(pattern).to, p);
        p = p.replace(pattern, to);
        return p.indexOf('.less') > -1 ? p.replace('.less', '.css'): p;
      }
    }
    return p;
  }
}

function parsePath (to, p) {
  if (!(typeof to === 'string')) {
    return new Error('the path '+ to +' must be string');
  }
  if (to.lastIndexOf('.') > -1) {
    return to;
  }
  else {
    return (to.slice(-1) === '/' ? to : to + path.sep) + soi.util.basename(p);
  }
}

module.exports = RuleMap;