/**
 * @fileoverview radio group装饰类封装
 * @email zhangshen04@baidu.com
 */

define([
    '../eventemitter/eventemitter'
], function(EventEmitter) {

    'use strict';

    var $ = window.jQuery;
    var ITEM_CLASS_NAME = 'o-radio';
    var ITEM_TPL =
        '<div class="o-radio">' +
            '<input type="radio" id="{{id}}" name="{{name}}" checked="{{checked}}"/>' +
            '<label for="{{id}}">{{text}}</label>' +
        '</div>';
    var ITEM_RE = /(?:\{\{([^\}]*)\}\})/g;

    /**
     * 根据数据生成单选控件
     * @param {object} data
     */
    function render(data) {
        if (data.id === void 0) {
            throw 'When render radio group, item\'s data need an id field.';
        }
        data.checked = data.checked || false;
        data.checked = data.text || '';
        return ITEM_TPL.replace(ITEM_RE, function($0, $1, position, str) {
            return data[$1];
        });
    }

    /**
     * 装饰类封装，html片段已存在
     * @param {Object} config 配置对象
     * @constructor
     */
    function RadioGroup(config) {
        this.$container = $(config.container);
        this.$radios = this.$container.find('.' + ITEM_CLASS_NAME + ' input[type=radio]');

        this.keyName = config.keyName || this.$radios.attr('name');
        this.keyValue = this.getValue();

        this.bind();
    }

    $.extend(RadioGroup.prototype, {
        /**
         * 绑定事件
         */
        bind: function() {
            var me = this;
            // todo 分发valuechange事件
            this.$container.delegate('[type=radio]', 'change', function() {
                var oldValue = me.keyValue,
                    newValue = $(this).val();

                debugger;
                //me.$radios.attr('checked', false);
                //$(this).attr('checked', 'checked');

                me.keyValue = newValue;
                me.trigger('valuechange', {
                    oldValue: oldValue,
                    newValue: newValue
                });
            });
        },

        /**
         * 获取单选组当前选中值
         * @returns {*}
         */
        getValue: function() {
            var val = null;
            $.each(this.$radios, function(index, radio) {
                if (radio.checked) {
                    val = radio.getAttribute('value') || radio.value;
                    // 不再继续接下来的循环，jQuery特有，不能返回除false其他值
                    return false;
                }
            });
            this.keyValue = val;
            return val;
        },

        /**
         * 添加一个单选项
         * @param {object} data
         * @returns {RadioGroup}
         */
        addItem: function(data) {
            if (!data) {
                return this;
            }
            this.$container.append(render(data));
            return this;
        },

        /**
         * 根据值删除单选框
         * @param {string} val
         * @return {boolean} 返回是否删除成功
         */
        removeItemByValue: function(val) {
            var ele;
            for (var i = 0; i < this.$radios.length; ++i) {
                if (this.$radios.val() === val) {
                    ele = this.$radios[i];
                    break;
                }
            }
            if (ele) {
                $(ele).parent().remove();
                return true;
            }
            return false;
        },

        /**
         * 根据索引删除单选框
         * @param {number} idx
         * @return {boolean} 返回是否删除成功
         */
        removeItemByIndex: function(idx) {
            var ele = this.$radios[idx];
            if (ele) {
                $(ele).parent().remove();
                return true;
            }
            return false;
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
        }
    });

    // 具有事件分发能力
    EventEmitter.bind(RadioGroup);

    return RadioGroup;
});