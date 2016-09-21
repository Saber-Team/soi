/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file 线上路径规则的Map
 * @author XCB, AceMood
 */

'use strict';

const node_path = require('path');
const util      = require('./util');

class RuleMap extends Map {
    constructor() {
        super();
    }

    /**
     * 判断当前是否含有给定的规则
     * @param {string|RegExp} key
     * @return {boolean}
     */
    exists(key) {
        if (this.get(key)) {
            return true;
        }

        if (key instanceof RegExp) {
            let keys = this.keys();
            for (let k of keys) {
                if ((k instanceof RegExp) &&
                    (k.source === key.source) &&
                    (k.multiline === key.multiline) &&
                    (k.global === key.global) &&
                    (k.ignoreCase === key.ignoreCase)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 合并两个规则集.
     * todo: string key would be override but regexp wouldn't
     * @param  {RuleMap} ruleMap
     * @param  {boolean=} override
     * @return {RuleMap}
     */
    merge(ruleMap, override) {
        override = !!override;
        if (ruleMap instanceof RuleMap) {
            let keys = ruleMap.keys();
            for (let key of keys) {
                if (override || !this.exists(key)) {
                    this.set(key, ruleMap.get(key));
                }
            }
        } else {
            throw new Error('invalid params');
        }
        return this;
    }

    /**
     * 添加规则
     * @param {string|RegExp} pattern 规则模式
     * @param {object} options
     * @return {RuleMap}
     */
    add(pattern, options) {
        options.pattern = pattern;
        options._reg = util.normalize(pattern);
        this.set(pattern, options);
        return this;
    }

    /**
     * 计算资源匹配的规则集
     * @param   {string} path
     * @returns {?object}
     */
    match(path) {
        let matchRule = [];
        this.forEach((options, pattern) => {
            if (options._reg.test(path)) {
                matchRule.push(options);
            }
        });

        return matchRule.length ? matchRule.pop() : null;
    }

    /**
     * 浅复制一份当前ruleMap
     * @return {RuleMap}
     */
    clone() {
        let map = new RuleMap();
        let keys = this.keys();
        for (let key of keys) {
            map.set(key, this.get(key));
        }
        return map;
    }
}

module.exports = RuleMap;