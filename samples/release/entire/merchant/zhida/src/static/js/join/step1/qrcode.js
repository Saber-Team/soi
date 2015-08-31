/**
 * @fileoverview 运营者邮箱字段
 *     利用inputfield做二次封装
 * @email zhangshen04@baidu.com
 */

define([
    '../../../../../../../xcom/inputfield/inputfield',
    '../../../../../../../xcom/inputfield/plugin-autosave',
    '../../../../../../../xcom/validator/validator',
    '../../../../../../common/js/api',
    './service'
], function (InputField, AutoSave, validator, api, service) {

    'use strict';

    var $ = window.jQuery;

    //=============================//
    // Helper Functions Start      //
    //=============================//

    function ticker ($dom) {
        $dom.addClass('btn-disabled');

        function loop () {
            counter--;
            if (counter === -1) {
                $dom.text('重新发送');
                $dom.removeClass('btn-disabled');
                $dom = null;
                return;
            }
            $dom.text('(' + counter + ')秒');
            timer = setTimeout(loop, 1000);
        }

        var counter = 60;
        var timer = setTimeout(loop, 1000);
    }

    //=============================//
    // Helper Functions End        //
    //=============================//

    /**
     * 验证码字段
     * @param {object} config
     * @constructor
     */
    function QRField (config) {
        // dom
        this.$container = $(config.container);
        this.$change = null;
        this.$view = null;
        this.$edit = null;
        this.$text = null;
        this.$getQR = null;

        // 组件
        this.valuefield = null;
        this.qrcodefield = null;

        // 属性
        this.autoSave = !!config.autoSave;
        this.validateType = config.validateType || 'required';
        this.isSending = false;
        this.inValidating = false;
        this.validaPromisedObj = null;
        this.state = 0;
    }

    $.extend(QRField.prototype, {
        /**
         * 初始化,没有值的情况显示编辑框
         * @param {string} value 字段值，没有值的情况显示编辑框
         */
        init: function (value) {
            // dom
            this.$view = this.$container.find('.view');
            this.$text = this.$view.find('div');
            this.$change = this.$view.find('span');
            this.$edit = this.$container.find('.edit');
            this.$getQR = this.$edit.find('.btn-30');

            // 组件，主域字段不进行自动保存功能，而在验证码字段失去焦点的时候
            // 服务端接口会进行保存
            this.valuefield = new InputField({
                container: this.$container.find('.o-inputfield')[0],
                validator: [validator.required, validator[this.validateType]],
                validateOnBlur: true
                //plugins: this.autoSave ? [new AutoSave(this.autoSaveCallback.bind(this))] : []
            });
            this.qrcodefield = new InputField({
                container: this.$container.find('.o-inputfield')[1],
                validator: validator.required,
                validateOnBlur: true
            });

            this.bind();

            // 更新视图
            this.setState(value ? QRField.State.VIEW : QRField.State.EDIT);
            this.setText(value);
        },

        /**
         * 返回主要输入框值
         * @returns {*|string}
         */
        getValue: function () {
            // 查看状态不需要重新保存，因为页面初始化返回的并非明文
            if (this.state === QRField.State.VIEW) {
                return null;
            }
            return this.valuefield.getValue();
        },

        /**
         * 返回主要输入框字段
         * @returns {*|{name, value}|{name: *, value: *}}
         */
        getKeyValue: function () {
            // 查看状态不需要重新保存，因为页面初始化返回的并非明文
            if (this.state === QRField.State.VIEW) {
                return null;
            }
            return this.valuefield.getKeyValue()
        },

        /**
         * 设置主要输入框的值
         * @param {string} val
         */
        setValue: function (val) {
            this.valuefield.setValue(val);
        },

        /**
         * 设置主要输入框的默认值
         * @param {string} val
         */
        setDefaultValue: function (val) {
            this.valuefield.setDefaultValue(val);
        },

        /**
         * 设置查看态显示的值
         * @param {string} txt
         * @private
         */
        setText: function (txt) {
            var txt = String(txt);
            if (this.$text) {
                this.$text.text(txt);
            }
        },

        /**
         * 根据值显示 查看态 或 编辑态
         * @param {number} value
         */
        setState: function (value) {
            if (value === QRField.State.EDIT) {
                this.$view.hide();
                this.$edit.show();
                this.state = QRField.State.EDIT;
            } else if (value === QRField.State.VIEW) {
                this.$edit.hide();
                this.$view.show();
                this.state = QRField.State.VIEW;
            }
        },

        /** 绑定事件 */
        bind: function () {
            var me = this;
            // 点击修改
            this.$change.click(function () {
                me.setState(QRField.State.EDIT);
            });
            // 获取验证码
            this.$getQR.click(function () {
                // 主域验证通过
                if (me.valuefield.validate()
                    && !me.$getQR.hasClass('btn-disabled')) {
                    me.isSending = true;
                    if (me.validateType === 'email') {
                        service.requestEmailQRcode(me.getValue());
                    } else if (me.validateType === 'phone') {
                        service.requestPhoneQRcode(me.getValue());
                    }
                    // 倒计时
                    ticker(me.$getQR);
                    me.isSending = false;
                }
            });
            // 失去焦点验证验证码字段
            this.qrcodefield.$input.blur(this.checkVcode.bind(this));
        },

        /**
         * 验证验证码
         */
        checkVcode: function () {
            if (this.qrcodefield.validate()) {
                this.inValidating = true;
                if (this.validateType === 'email') {
                    this.validaPromisedObj =  service.checkEmailVcode(
                        this.valuefield.getValue(),
                        this.qrcodefield.getValue()
                    );
                    this.validaPromisedObj.done(this.checkCallback.bind(this));
                } else if (this.validateType === 'phone') {
                    this.validaPromisedObj = service.checkPhoneVcode(
                        this.valuefield.getValue(),
                        this.qrcodefield.getValue()
                    );
                    this.validaPromisedObj.done(this.checkCallback.bind(this));
                }
            }
        },

        /**
         * 异步验证回调
         * @param {Object} res
         */
        checkCallback: function (res) {
            this.inValidating = false;
            if (res.error_code) {
                this.qrcodefield.setErrorMsg('不合法的验证码');
                this.qrcodefield.showError();
            } else {
                this.qrcodefield.setErrorMsg('');
                this.qrcodefield.hideError();

                debugger;

                this.setText(res.data);
                this.setState(QRField.State.VIEW);
            }
        },

        /**
         * 因为存在异步校验，需要返回对象或者promised，
         * 返回值同server返回保持一致
         * @returns {*}
         */
        validate: function () {
            if (this.state === QRField.State.VIEW) {
                return {
                    result: 1,
                    data: this.$text.text()
                };
            }
            if (!this.valuefield.validate()) {
                return {
                    error_code: 1,
                    error_msg: (this.validateType === 'email' ? '邮箱' : '手机号码') + '格式不正确'
                };
            }
            if (!this.qrcodefield.validate()) {
                return {
                    error_code: 1,
                    error_msg: '验证码不能为空'
                };
            }

            if (this.inValidating) {
                return this.validaPromisedObj;
            }

            if (this.validateType === 'email') {
                return service.checkEmailVcode(
                    this.valuefield.getValue(),
                    this.qrcodefield.getValue()
                );
            } else if (this.validateType === 'phone') {
                return service.checkPhoneVcode(
                    this.valuefield.getValue(),
                    this.qrcodefield.getValue()
                );
            }
        },

        /**
         * 自动保存
         */
        /*autoSaveCallback: function() {
            var data = {};
            var kv = this.getKeyValue();
            data[kv.name] = kv.value;

            $.post(api.zhida.updateQua, {
                bdstoken: GlobalInfo.bdstoken,
                data: JSON.stringify(data)
            }).done(function(data) {
                if (data.error_msg) {

                }
            });
        },*/

        /** 解绑事件 */
        unbind: function () {
            this.$change.off();
            this.$getQR.off();
        },

        /** 析构 */
        destroy: function () {
            this.unbind();
            //this.remove();
        }
    });

    // 状态枚举
    QRField.State = {
        VIEW: 0,
        EDIT: 1
    };

    return QRField;
});