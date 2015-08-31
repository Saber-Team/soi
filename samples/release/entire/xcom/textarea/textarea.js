/**
 * @fileoverview 表单输入域
 * @email zhangshen04@baidu.com
 */

define([
    './tpl',
    '../eventemitter/eventemitter'
], function (tpl, EventEmitter) {

    'use strict';

    var $ = window.jQuery;

    // 生成dom时默认的配置
    var defaultObj = {
        maxLength: 200,
        value: '',
        texttip: '',
        errmsg: '',
        name: ''
    };

    /**
     * 配置对象
     * @param {Object} config
     * @constructor
     */
    function TextAreaField (config) {
        if (config && config.container) {
            this.init(config);
        }
    }

    $.extend(TextAreaField.prototype, {
        /**
         * 初始化
         * @param {Object} config
         */
        init: function (config) {
            this.$container = $(config.container);
            this.$input = this.$container.find('textarea');
            this.$tip = this.$container.find('textarea+i');
            this.$errortip = this.$container.find('.error');

            // 是否失去焦点时验证
            this.validateOnBlur = !!config.validateOnBlur;

            // 需要提取时返回的键值分别是什么
            this.keyName = config.keyName
                || this.$input.attr('name')
                || this.$container.attr('data-name');
            this.defaultValue = this.$input.val();
            this.maxLength = config.maxLength || 30;
            this.validator = config.validator || null;

            // 应用插件
            this.apply(config.plugins || []);
            this.bind();
            this.updateCharNumber();
        },

        /**
         * 应用插件
         * @param {?Array} plugins
         */
        apply: function (plugins) {
            for (var i = 0; i < plugins.length; ++i) {
                plugins[i].init(this);
            }
        },

        /** 绑定事件 */
        bind: function () {
            // 更新字数
            this.$input.on('keyup', this.updateCharNumber.bind(this));
            // 失焦校验
            this.$input.blur(this.onBlurInternal.bind(this));
        },

        /** 更新字数 */
        updateCharNumber: function () {
            if (this.$tip) {
                this.$tip.html('<em>' + this.$input.val().length + '</em>/' + this.maxLength);
            }
        },

        /**
         * 验证字段
         * @returns {Boolean}
         */
        validate: function() {
            if (!this.validator) {
                return true;
            }

            var ret = true;
            var validator;
            var val = this.$input.val();

            if ($.isArray(this.validator)) {
                for (var i = 0; i < this.validator.length; ++i) {
                    validator = this.validator[i];
                    ret = validator.validate(val);
                    if (!ret.result) {
                        break;
                    }
                }
            } else {
                ret = this.validator.validate(val);
            }

            if (!ret.result) {
                this
                    .setErrorMsg(ret.msg)
                    .showError();
            } else {
                this
                    .setErrorMsg('')
                    .hideError();
            }
            return ret.result;
        },

        /**
         * 返回值
         * @returns {*}
         */
        getValue: function () {
            return this.getValueInternal();
        },

        /**
         * 返回键值对
         * @return {Object}
         */
        getKeyValue: function () {
            return {
                name: this.keyName,
                value: this.getValue()
            }
        },

        /**
         * 设置回填字段值
         * @param {string} val
         */
        setValue: function (val) {
            this.$input.val(String(val));
            this.updateCharNumber();
        },

        /**
         * 设置默认值
         * @param {*|string} val
         */
        setDefaultValue: function (val) {
            this.defaultValue = String(val);
        },

        /**
         * 获取初始化时的默认值
         * @return {*|string}
         */
        getDefaultValue: function () {
            return this.getDefaultValueInternal();
        },

        /**
         * 创建dom
         * @param {Object} data
         */
        createDom: function (data) {
            data = data || defaultObj;
            var html = tpl.template.replace(tpl.re, function($0, $1, position, str) {
                return data[$1];
            });
            var frag = document.createDocumentFragment();
            frag.innerHTML = html;
            return frag.firstChild;
        },

        /** 显示错误提示 */
        showError: function () {
            this.$container.addClass('error');
            return this;
        },

        /** 隐藏错误提示 */
        hideError: function () {
            this.$container.removeClass('error');
            return this;
        },

        /**
         * 设置错误消息
         * @param {string} msg
         */
        setErrorMsg: function (msg) {
            this.$errortip.text(msg);
            return this;
        },

        /** 析构 */
        destroy: function () {
            // 组件destroy
            // 属性重置
            this.handlerManager = null;
            // 解绑dom事件及元素销毁
            this.$input.off();
            this.$tip.off();
            this.$errortip.off();
            this.$container.remove();
            // 引用
            this.$input = null;
            this.$tip = null;
            this.$errortip = null;
            this.$container = null;
        },

        //=========== 插件扩展点的方法 ============

        /**
         * 失去焦点的校验
         * @protected
         */
        onBlurInternal: function () {
            if (this.validateOnBlur) {
                this.validate();
            }
        },

        /**
         * 返回值
         * @returns {*}
         */
        getValueInternal: function () {
            return this.$input.val();
        },

        /**
         * 获取初始化时的默认值
         * @return {*|string}
         */
        getDefaultValueInternal: function () {
            return this.defaultValue;
        }
    });

    EventEmitter.bind(TextAreaField);

    return TextAreaField;
});