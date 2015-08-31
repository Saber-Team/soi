/**
 * @fileoverview 企业组织名称字段
 *     利用inputfield做二次封装
 * @email zhangshen04@baidu.com
 */

define([
    '../../../../../../../xcom/inputfield/inputfield',
    '../../../../../../../xcom/inputfield/plugin-autosave',
    '../../../../../../../xcom/inputfield/plugin-encoding',
    '../../../../../../../xcom/validator/validator',
    '../../../../../../common/js/api',
    '../../../../../../common/js/msg'
], function (InputField, AutoSave, Encoding, validator, api, msg) {

    'use strict';

    var $ = window.jQuery;
    var $container;

    // 组件
    var inputfield;

    /**
     * 返回值
     * @returns {*|string}
     */
    function getValue () {
        return inputfield.getValue()
    }

    /**
     * 返回字段
     * @returns {*|{name, value}|{name: *, value: *}}
     */
    function getKeyValue () {
        return inputfield.getKeyValue()
    }

    /**
     * 设置输入框的值
     * @param {string} val
     */
    function setValue (val) {
        inputfield.setValue(val);
    }

    /**
     * 设置输入框的默认值
     * @param {string} val
     */
    function setDefaultValue(val) {
        inputfield.setDefaultValue(val);
    }

    /**
     * 设置组织类型后界面需要变化
     * @param {string} orgType
     */
    function setState (orgType) {
        if (orgType === '1') {
            $container.find('label').text('企业名称：');
            $('#company_name').attr('placeholder', '请输入营业执照注册号上的企业名称');
            $container.find('.tip').text('个体工商户请填"字号名称", 无名称的填写"无"');
        } else if (orgType === '2') {
            $container.find('label').text('组织名称：');
            $('#company_name').attr('placeholder', '请输入组织机构代码证上的组织名称');
            $container.find('.tip').text('');
        }
    }

    /**
     * 返回校验结果
     * @returns {boolean}
     */
    function validate () {
        if (inputfield) {
            return inputfield.validate();
        } else {
            return false;
        }
    }

    /**
     * 初始化，依赖两个值：组织类型和是否自动保存
     * @param {string} orgType
     * @param {boolean} isOnline
     */
    function init (orgType, isOnline) {
        $container = $('.f-companyName');
        setState(orgType);
        inputfield = new InputField({
            container: $('.f-companyName .o-inputfield'),
            maxLength: 100,
            validator: [validator.required, validator.specialChars],
            validateOnBlur: true,
            plugins: isOnline ? [
                new Encoding()
            ] : [
                new AutoSave(autoSaveCallback),
                new Encoding()
            ]
        });
    }

    /** 自动保存 */
    function autoSaveCallback () {
        var postData = {
            bdstoken: GlobalInfo.bdstoken
        };
        var kv = getKeyValue();
        postData['data[' + kv.name + ']'] = kv.value;
        $.post(api.zhida.updateQua, postData).done(function (res) {
            if (res.error_code) {
                inputfield.setErrorMsg(msg[res.error_code] || '返回错误');
                inputfield.showError();
            } else {
                inputfield.setErrorMsg('');
                inputfield.hideError();
            }
        });
    }

    return {
        init: init,
        setState: setState,
        getKeyValue: getKeyValue,
        getValue: getValue,
        setValue: setValue,
        setDefaultValue: setDefaultValue,
        validate: validate
    };
});