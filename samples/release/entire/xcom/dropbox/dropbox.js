/**
 * @fileoverview 下拉列表, 尽量统一简单, 只做最简单封装, 样式复用`./dropbox.css`
 * @email zhangshen04@baidu.com
 */

define([
    '../eventemitter/eventemitter',
    './tpl'
], function(EventEmitter, tpl) {

    'use strict';

    var $ = window.jQuery;
    var ITEM_TPL = '<li data-value="{{value}}">{{text}}</li>';
    var ITEM_RE = /(?:\{\{([^}]*)}})/g;


    /**
     * 控件类包装
     * @param {Object} config
     * @constructor
     */
    function DropBox(config) {
        this.$container = $(config.container);
        this.$arrow = this.$container.find('i');
        this.$txtbox = this.$container.find('.txt');
        this.$list = this.$container.find('ul');

        // 需要提取时返回的键值分别是什么
        this.keyName = config.keyName || this.$container.attr('data-name');
        this.keyValue = this.$container.attr('data-value') || '';
        this.valueAttr = config.valueAttr || 'data-value';

        this.bind();
    }

    $.extend(DropBox.prototype, {
        /**
         * 绑定交互事件
         */
        bind: function() {
            var me = this;
            this.$container
                .click(function(e) {
                    var target = e.target;
                    if (target === me.$arrow[0] ||
                        target === me.$txtbox[0]) {
                        me.$container.addClass('active');
                        me.showList();
                    } else if (target.tagName === 'LI') {
                        me.$container.removeClass('active');
                        me
                            .setText($(target).text())
                            .setValue($(target).attr(me.valueAttr))
                            .hideList();

                    }
                });

            this._boundBlur = this._blur.bind(this);
            $(document).click(this._boundBlur);
        },

        /**
         * 获取当前值
         * @returns {*}
         */
        getValue: function() {
            return this.$container.attr('data-value');
        },

        /**
         * 获取显示文本
         * @returns {*}
         */
        getText: function() {
            return this.$txtbox.text();
        },

        /**
         * 设置显示文本
         * @param {string} txt
         * @returns {DropBox}
         */
        setText: function(txt) {
            this.$txtbox.text(txt);
            return this;
        },

        /**
         * 设置值
         * @param {string} val
         * @returns {DropBox}
         */
        setValue: function(val) {
            var oldVal = this.$container.attr('data-value');
            this.$container.attr('data-value', val);
            this.keyValue = val;
            if (oldVal !== val) {
                this.trigger('valuechange', {
                    oldValue: oldVal,
                    newValue: val
                })
            }
            return this;
        },

        /**
         * 隐藏列表
         * @returns {DropBox}
         */
        hideList: function() {
            this.$list.hide();
            return this;
        },

        /**
         * 显示列表
         * @returns {DropBox}
         */
        showList: function() {
            this.$list.show();
            return this;
        },

        /**
         * 根据数据渲染列表
         * @param {Array} data
         */
        render: function(data) {
            if (!data) return;
            var html = '';
            for (var i = 0; i < data.length; ++i) {
                html += ITEM_TPL.replace(ITEM_RE, function($0, $1, position, str) {
                    return data[i][$1];
                });
            }
            this.$list.html(html);
            // 重新渲染后默认选中第一项
            $(this.$list.find('li')[0]).click();
        },

        /**
         * 返回键值对方便序列化
         * @returns {{name: *, value: *}}
         */
        getKeyValue: function() {
            return {
                name: this.keyName,
                value: this.keyValue
            }
        },

        /**
         * 创建dom
         * @param {Object} data
         * @return {Node}
         */
        createDom: function(data) {
            data = data || defaultObj;
            var html = tpl.template.replace(tpl.re, function($0, $1, position, str) {
                return data[$1];
            });
            var frag = ducoment.createDocumentFragment();
            frag.innerHTML = html;
            return frag.firstChild;
        },

        /**
         * 失去焦点的句柄
         * @param {Event} e
         * @private
         */
        _blur: function(e) {
            if (!$.contains(this.$container[0], e.target)) {
                this.$container.removeClass('active');
                this.hideList();
            }
        },

        /** 析构 */
        destroy: function() {
            // 组件destroy
            // 属性重置
            // 解绑dom事件及元素销毁
            $(document).off('click', this._boundBlur);
            this.$arrow.off();
            this.$txtbox.off();
            this.$list.off();
            this.$container.remove();
            // 引用
            this.$arrow = null;
            this.$txtbox = null;
            this.$list = null;
            this.$container = null;
        }
    });

    // 具有事件分发能力
    EventEmitter.bind(DropBox);

    return DropBox;

});