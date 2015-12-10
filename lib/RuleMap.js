/**
 * @file 规则Map
 * @author XCB
 */

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

/**
 * 与其他ruleMap对象合并规则
 * @param {RuleMap} ruleMap 其他ruleMap对象
 */
RuleMap.prototype.merge = function (ruleMap) {
  if (ruleMap instanceof RuleMap) {
    var needMergeMaps = ruleMap.getMap();
    for (var prop in needMergeMaps) {
      if (needMergeMaps.hasOwnProperty(prop)) {
        this._map[prop] = needMergeMaps[prop];
      }
    }
  }
  else {
    throw new Error('invalid params');
  }
};

module.exports = RuleMap;