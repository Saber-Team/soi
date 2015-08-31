/**
 * @fileoverview 切换组织类型
 * @email zhangshen04@baidu.com
 */

define([
    '../../../../../../../xcom/eventemitter/eventemitter'
], function(EventEmitter) {

    'use strict';

    var $ = window.jQuery;

    // dom
    var $container;
    var $orgType;

    // 属性
    var orgType = '1'; // 1是企业 2是组织

    /**
     * 初始化
     * @param {string} orgType
     */
    function init(orgType) {
        $container = $('.step-1 .f-orgType');
        $orgType = $('#org_type');
        bind();

        orgType = String(orgType) || '1';
        $container.find('[data-value=' + orgType + ']').click();
    }

    /**
     * 返回组织类型
     * @returns {string}
     */
    function getValue() {
        return orgType;
    }

    /**
     * 返回当前字段值
     * @returns {{name: string, value: string}}
     */
    function getKeyValue() {
        return {
            name: 'org_type',
            value: orgType
        }
    }

    function bind() {
        // 点击切换
        $orgType.delegate('span', 'click', function(e) {
            var oldValue = orgType;
            var type = $(e.target).attr('data-value');
            if (type !== orgType) {
                $orgType.find('span').removeClass('actived');
                $orgType.find('[data-value=' + type + ']').addClass('actived');
                orgType = type;
                exports.trigger('valuechange', {
                    oldValue: oldValue,
                    newValue: orgType
                })
            }
        });
    }

    var exports = {
        init: init,
        getValue: getValue,
        getKeyValue: getKeyValue
    };

    EventEmitter.inject(exports);

    return exports;
});