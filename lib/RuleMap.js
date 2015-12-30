/**
 * @file 规则Map
 * @author XCB
 */

var path = require('path');

function RuleMap() {
  this._map = {};
  this._ruleNameMap = [];
}

/**
 * 添加规则
 * @param {String | Regex} pattern 规则模式
 * @param {?Object} options
 */
RuleMap.prototype.add = function (pattern, options) {
  this._map[pattern] = options;
  this._ruleNameMap.push(pattern);
};

/**
 * 获取规则
 * @returns {{}|*}
 */
RuleMap.prototype.getMap = function () {
  return this._map;
};

/**
 * 获取rulemap的规则
 * @returns {Array}
 */
RuleMap.prototype.getMapName = function () {
  return this._ruleNameMap;
};

/**
 * 获取规则对应的参数选项
 * @param  {String} rule 规则名称
 * @returns {*}
 */
RuleMap.prototype.getRuleOptions = function (rule) {
  return this._map[rule];
};

RuleMap.prototype.match = function (resource) {
  var matchRule = [];
  this._ruleNameMap.forEach(function(pattern) {
    soi.util.normalize(pattern).test(resource) && matchRule.push(pattern);
  });
  return matchRule;
};

/**
 * 与其他ruleMap对象合并规则
 * @param {RuleMap} ruleMap 其他ruleMap对象
 */
RuleMap.prototype.merge = function (ruleMap) {
  if (ruleMap instanceof RuleMap) {
    var needMergeMaps = ruleMap.getMap();
    var mapNames = ruleMap.getMapName();
    for(var i = 0, l = mapNames.length; i < l; i++) {
      this._ruleNameMap.push(mapNames[i]);
      this._map[mapNames[i]] = needMergeMaps[mapNames[i]];
    }
  }
  else {
    throw new Error('invalid params');
  }
};

/**
 * 根据path获取线上的url
 * @param {String} p
 */
RuleMap.prototype.getUriByPath = function (p) {
  var that = this;

  for(var i = that._ruleNameMap.length -1; i >= 0; i--) {
    var pattern = that._ruleNameMap[i];
    if (soi.util.normalize(pattern).test(p)) {
      var to = parsePath(that._map[pattern].to, p);
      //debugger
      p = p.replace(pattern, to);
      return p.indexOf('.less') > -1 ? p.replace('.less', '.css'): p;
    }
  }
  return p;
};

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