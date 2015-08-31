/**
 * @fileoverview 引导第二步
 * @email zhangshen04@baidu.com
 */

define([
    './warning',
    '../../../../../../../xcom/uploader/uploader',
    '../../../../../../../xcom/logoupload/logoupload',
    '../../../../../../../xcom/inputfield/inputfield',
    '../../../../../../../xcom/inputfield/plugin-autosave',
    '../../../../../../../xcom/inputfield/plugin-encoding',
    '../../../../../../../xcom/textarea/textarea',
    '../../../../../../../xcom/textarea/plugin-autosave',
    '../../../../../../../xcom/textarea/plugin-encoding',
    '../../../../../../../xcom/validator/validator',
    '../../../../../../../xcom/eventemitter/eventemitter',
    '../../../../../../common/js/api',
    '../../../../../../common/js/msg',
    './logo',
    './brand',
    '../step1/main'
], function (warning, Uploader, LogoUpload, InputField, AutoSave, Encoding, TextArea, TAAutoSave,
             TAEncoding, validator, EventEmitter, api, msg, logoInjector, brandInjector, step1) {

    'use strict';

    var $ = window.jQuery;

    // dom
    var $view;
    var $prev;
    var $submit;

    // 是否已经初始化
    var inited = false;
    // 是否已经上线，会影响到是否需要实时保存
    // 和下一步/取消的行为
    // 和第二步提交调用的接口
    var isOnline = false;
    // 是否免认证用户
    var isSSG = false;

    // 组件
    var query;
    var summary;
    var logo;
    var brand;

    /**
     * 每个输入框，自动保存的回调，
     * 这一步如果有app_id需要带上
     * @param {InputField} inputfield
     */
    function autoSaveCallback (inputfield) {
        var postData = {
            bdstoken: GlobalInfo.bdstoken
        };
        var kv = inputfield.getKeyValue();
        postData['new_data[' + kv.name + ']'] = kv.value;
        if (GlobalInfo.app_id) {
            postData.app_id = GlobalInfo.app_id;
        }
        $.post(api.zhida.updateZhidaInfo, postData).done(function (res) {
            if (res.error_code) {
                inputfield.setErrorMsg(msg[res.error_code] || '返回错误');
                inputfield.showError();
            } else {
                inputfield.setErrorMsg('');
                inputfield.hideError();
            }
        });
    }

    /**
     * 初始化操作
     * @param {boolean} isShow 是否显示第一步界面
     */
    function init (isShow) {
        isShow = !!isShow;

        // dom
        $view = $('.step-2');
        $prev = $view.find('.buttons div:first-child');
        $submit = $view.find('.buttons div:last-child');

        // 请求数据
        var postData = {
            bdstoken: GlobalInfo.bdstoken
        };
        if (GlobalInfo.app_id) {
            postData.app_id = GlobalInfo.app_id;
        }
        $.get(api.zhida.getZhidaInfo, postData, function (data) {
            if (data.error_code) {
                // todo
            } else if (Number(data.count) === 1
                || Number(data.count) === 0) {
                // data有可能是空数组
                data = data.data[0] ? data.data[0] : {};
                isOnline = (Number(GlobalInfo.status) >= 4);
                if (isShow) {
                    show();
                }

                // 审核不通过显示
                if ((GlobalInfo.status === '3'
                    || GlobalInfo.status === '7')
                    && data.audit_comment) {
                    warning.init(data.audit_comment);
                    warning.show();
                } else {
                    warning.init('');
                    warning.hide();
                }

                // 直达号名称
                query = new InputField({
                    container: $('.f-query .o-inputfield'),
                    validator: [
                        validator.required,
                        validator.specialChars,
                        validator.queryWord
                    ],
                    validateOnBlur: true,
                    plugins: isOnline ? [
                        new Encoding()
                    ] : [
                        new AutoSave(autoSaveCallback),
                        new Encoding()
                    ]
                });
                query.setValue(data.query || '');
                query.setDefaultValue(data.query || '');

                // 直达号简介
                summary = new TextArea({
                    container: $('.f-summary .o-textarea'),
                    validator: [
                        validator.required,
                        validator.length(20, 200)
                    ],
                    validateOnBlur: true,
                    maxLength: 200,
                    plugins: isOnline ? [
                        new TAEncoding()
                    ] : [
                        new AutoSave(autoSaveCallback),
                        new TAEncoding()
                    ]
                });
                summary.setValue(data.summary || '');
                summary.setDefaultValue(data.summary || '');

                // 直达号logo
                logo = new LogoUpload({
                    url: '__UPLOAD__',
                    paramName: 'ufile',
                    maxSize: FileAPI.MB * 0.3,
                    pick: '.f-logo .o-webuploader',
                    data: {
                        bdstoken: GlobalInfo.bdstoken,
                        from_hash: 1,
                        upload_type: 'zhidahao_icon'
                    }
                });
                logo.init(data.logo90 || '');
                // todo
                logoInjector(logo);
                logo.initFormAttrInternal({
                    container: '.f-logo .o-webuploader'
                });
                logo.setStateInternal(data.logo90 ? {
                    logo90: data.logo90 || '',
                    logo75: data.logo75 || '',
                    logo48: data.logo48 || '',
                    logo24: data.logo24 || '',
                    logo200: data.logo200 || '',
                    logo512: data.logo512 || ''
                } : null);
                logo.bindInternal();

                // 商标材料
                brand = new Uploader({
                    server: '__UPLOAD__',
                    fileVal: 'ufile',
                    pick: {
                        id: '#brand',
                        multiple: true
                    },
                    formData: {
                        bdstoken: GlobalInfo.bdstoken,
                        from_hash: 1,
                        upload_type: 'identity_photo'
                    },
                    fileSizeLimit: 10 * 1024 * 1024,
                    fileNumExist: data.brand_cert ? data.brand_cert.length : 0,
                    fileNumLimit: 10
                });
                brand.init();
                brandInjector(brand);
                brand.initFormAttrInternal({
                    container: '.f-brand .o-webuploader',
                    keyName: 'brand_cert',
                    keyValue: data.brand_cert || []
                });
                brand.setStateInternal(data.brand_cert ? data.brand_cert : []);
                brand.bindInternal();

                exports.inited = true;
                bind();
            }
        });
    }

    /** 事件绑定 */
    function bind () {
        // 提交
        $submit.click(function () {
            validate(function (result) {
                if (result === true) {
                    if (isOnline && !isSSG) {
                        // 保存前两步
                        submitAll().done(function (res) {
                            if (res.error_code) {
                                // todo
                            } else {
                                location.reload();
                            }
                        });
                    } else {
                        // 只保存当前步骤
                        saveAll().done(function (res) {
                            if (res.error_code) {
                                // todo
                            } else {
                                location.reload();
                            }
                        });
                    }
                }
            });
        });
        // 上一步
        $prev.click(function () {
            $view.hide();
            exports.trigger('step', 1);
            /*
            validate(function (result) {
                if (result === true) {
                    if (isOnline) {
                        $view.hide();
                        exports.trigger('step', 1);
                    } else {
                        saveAll().done(function (res) {
                            // todo
                            if (res.error_code) {

                            } else {
                                $view.hide();
                                exports.trigger('step', 1);
                            }
                        });
                    }
                }
            });
            */
        });
    }

    /**
     * 上一步和提交的时候执行
     * @param {Function} callback
     */
    function validate (callback) {
        var ret = query.validate()
            && summary.validate()
            && logo.validate()
            && brand.validate();

        callback(ret);
    }

    /** 展示 */
    function show () {
        $view.show();
    }

    /** 隐藏 */
    function hide () {
        $view.hide();
    }

    /**
     * 上一步和提交的时候，通过各字段验证后需要执行save操作
     * @returns {Promised}
     */
    function saveAll () {
        var data = getFormData();
        return $.post(api.zhida.addZhidaInfo, data);
    }

    /**
     * 返回当前需要保存的字段对象,
     * 需要带上app_id
     * @return {Object}
     */
    function getFormData () {
        var data = {};
        var controls = [query, summary, brand];
        for (var i = 0; i < controls.length; ++i) {
            var kv = controls[i].getKeyValue();
            if (kv) {
                data[kv.name] = kv.value;
            }
        }
        $.extend(data, logo.getKeyValue());
        data.bdstoken = GlobalInfo.bdstoken;
        if (GlobalInfo.app_id) {
            data.app_id = GlobalInfo.app_id;
        }
        return data;
    }

    /**
     * 直达号上线后，需要保存第一步和第二步的字段
     * @return {Promised}
     */
    function submitAll () {
        var data = {};
        $.extend(data, step1.getFormData(), getFormData());
        return $.post(api.zhida.addQuaAndZhida, data);
    }

    /**
     * 设置通知消息
     * @param {boolean} b
     */
    function setSSG (b) {
        isSSG = b;
    }

    var exports = {
        inited: inited,
        init: init,
        show: show,
        hide: hide,
        setSSG: setSSG
    };

    EventEmitter.inject(exports);

    return exports;
});