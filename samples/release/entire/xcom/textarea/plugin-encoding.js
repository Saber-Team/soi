/**
 * @fileoverview 应用插件将字段的keyValue和getValue
 *     方法的返回值自动url编码
 * @email zhangshen04@baidu.com
 */

define(function () {

    'use strict';

    /**
     * 插件构造函数
     * @constructor
     */
    function Encoding () { }

    $.extend(Encoding.prototype, {
        /**
         * 初始化插件
         * @param {InputField} host 输入框组件实例
         */
        init: function (host) {
            /**
             * 返回值
             * @returns {*}
             */
            host.getValueInternal = function () {
                return encodeURIComponent(this.$input.val());
            };

            /**
             * 获取初始化时的默认值
             * @return {*|string}
             */
            host.getDefaultValueInternal = function() {
                return encodeURIComponent(this.defaultValue);
            };
        }
    });

    return Encoding;
});