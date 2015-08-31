/**
 * @fileoverview
 * @email zhangshen04@baidu.com
 */

define(function() {

    'use strict';

    /**
     * 自动保存构造函数
     * @param {Function} callback
     * @param {*} context
     * @constructor
     */
    function AutoSave(callback, context) {
        this.callback = callback;
        this.context = context || null;
    }

    $.extend(AutoSave.prototype, {
        /**
         * 初始化插件
         * @param {InputField} host 输入框组件实例
         */
        init: function(host) {
            var me = this;
            // 重载
            host.onBlurInternal = function() {
                var ret;
                var val = this.$input.val();

                if (this.validateOnBlur) {
                    ret = this.validate();
                }
                // 通过了校验且与最初的值发生了变化
                if (ret && val !== this.defaultValue) {
                    // 保存上一次保存的值
                    this.setDefaultValue(val);
                    me.callback.call(me.context, host);
                }
            };
        }
    });

    return AutoSave;
});