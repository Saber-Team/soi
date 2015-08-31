/**
 * @fileoverview 引导第一步
 * @email zhangshen04@baidu.com
 */

define([
    './warning',
    './slider',
    './companyName',
    './qrcode',
    '../../../../../../../xcom/uploader/uploader',
    '../../../../../../../xcom/inputfield/inputfield',
    '../../../../../../../xcom/inputfield/plugin-autosave',
    '../../../../../../../xcom/inputfield/plugin-encoding',
    '../../../../../../../xcom/validator/validator',
    '../../../../../../../xcom/eventemitter/eventemitter',
    '../../../../../../common/js/api',
    '../../../../../../common/js/msg',
    './uploader-inject'
], function (warning, slider, companyName, QRField, Uploader, InputField,
             AutoSave, Encoding, validator, EventEmitter, api, msg, inject) {

    'use strict';

    var $ = window.jQuery;

    // dom
    var $view;
    var $next;
    var $cancel;
    var $agree;
    var $ssg;

    // 是否已经初始化
    var inited = false;
    // 是否已经上线，会影响到是否需要实时保存
    // 和下一步/取消的行为
    // 和第二步提交调用的接口
    var isOnline = false;
    // 是否免认证用户
    var isSSG = false;

    // 当前选择的组织类型
    var state;

    // 组件
    var busLicUrl;
    var busLicNum;
    var orgInsUrl;
    var orgInsNum;
    var legalIdUrl;
    var legalIdBackUrl;
    var name;
    var legalIdNo;
    var email;
    var phone;

    // 保存不同类型下需要更新提交的组件数组
    var Org_Saved_Array = {
        '1': [],
        '2': []
    };

    /**
     * 每个输入框，自动保存的回调
     * @param {InputField} inputfield
     */
    function autoSaveCallback (inputfield) {
        var postData = {
            bdstoken: GlobalInfo.bdstoken
        };
        var kv = inputfield.getKeyValue();
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

    /**
     * 初始化操作
     * @param {boolean} isShow 是否显示第一步界面
     */
    function init (isShow) {
        isShow = !!isShow;

        // dom
        $view = $('.step-1');
        $next = $view.find('.buttons div:first-child');
        $cancel = $view.find('.buttons div:last-child');
        $agree = $view.find('#agree');
        $ssg = $view.find('.ssg');

        // 请求数据
        $.get(api.zhida.getQua, {
            bdstoken: GlobalInfo.bdstoken
        }, function (data) {
            if (data.error_code) {
                // todo
            } else {
                isOnline = (Number(GlobalInfo.status) >= 4);
                isSSG = (Number(data.qua_from) > 0);

                // 分发事件
                exports.trigger('bind:ssg', isSSG);

                if (isShow) {
                    show();
                }

                if (isSSG) {
                    $ssg.show();
                    warning.init('');
                    warning.hide();
                    $view.find('form').hide();
                } else {
                    $ssg.hide();
                    $view.find('form').show();

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

                    // 组织类型
                    slider.init(data.org_type);
                    // 营业执照扫描件
                    busLicUrl = new Uploader({
                        server: '__UPLOAD__',
                        fileVal: 'ufile',
                        pick: {
                            id: '#bus_lic_url',
                            multiple: false
                        },
                        formData: {
                            bdstoken: GlobalInfo.bdstoken,
                            from_hash: 1,
                            upload_type: 'identity_photo'
                        },
                        fileNumExist: data.bus_lic_url ? 1 : 0,
                        fileNumLimit: 1
                    });
                    busLicUrl.init();
                    inject(busLicUrl);
                    busLicUrl.initFormAttrInternal({
                        container: '.f-busLicUrl .o-webuploader',
                        keyName: 'bus_lic_url',
                        keyValue: data.bus_lic_url || ''
                    });
                    busLicUrl.setStateInternal(data.bus_lic_url || '');
                    busLicUrl.bindInternal();
                    // 营业执照注册号
                    busLicNum = new InputField({
                        container: $('.f-busLicNum .o-inputfield'),
                        validator: [validator.required, validator.illegalCharWithBracket],
                        validateOnBlur: true,
                        plugins: isOnline ? [
                            new Encoding()
                        ] : [
                            new AutoSave(autoSaveCallback),
                            new Encoding()
                        ]
                    });
                    busLicNum.setValue(data.bus_lic_num || '');
                    busLicNum.setDefaultValue(data.bus_lic_num || '');

                    // 组织机构代码证
                    orgInsUrl = new Uploader({
                        server: '__UPLOAD__',
                        fileVal: 'ufile',
                        pick: {
                            id: '#org_ins_url',
                            multiple: false
                        },
                        formData: {
                            bdstoken: GlobalInfo.bdstoken,
                            from_hash: 1,
                            upload_type: 'identity_photo'
                        },
                        fileNumExist: data.org_ins_url ? 1 : 0,
                        fileNumLimit: 1
                    });
                    orgInsUrl.init();
                    inject(orgInsUrl);
                    orgInsUrl.initFormAttrInternal({
                        container: '.f-orgInsUrl .o-webuploader',
                        keyName: 'org_ins_url',
                        keyValue: data.org_ins_url || ''
                    });
                    orgInsUrl.setStateInternal(data.org_ins_url || '');
                    orgInsUrl.bindInternal();
                    // 组织机构代码证号
                    orgInsNum = new InputField({
                        container: $('.f-orgInsNum .o-inputfield'),
                        validator: [validator.required, validator.illegalCharWithBracket],
                        validateOnBlur: true,
                        plugins: isOnline ? [
                            new Encoding()
                        ] : [
                            new AutoSave(autoSaveCallback),
                            new Encoding()
                        ]
                    });
                    orgInsNum.setValue(data.org_ins_num || '');
                    orgInsNum.setDefaultValue(data.org_ins_num || '');

                    // 企业/组织名称
                    companyName.init(data.org_type, isOnline);
                    companyName.setValue(data.company_name || '');
                    companyName.setDefaultValue(data.company_name || '');

                    // 运营者身份证正面照
                    legalIdUrl = new Uploader({
                        server: '__UPLOAD__',
                        fileVal: 'ufile',
                        pick: {
                            id: '#legal_id_url',
                            multiple: false
                        },
                        formData: {
                            bdstoken: GlobalInfo.bdstoken,
                            from_hash: 1,
                            upload_type: 'identity_photo'
                        },
                        fileNumExist: data.legal_id_url ? 1 : 0,
                        fileNumLimit: 1
                    });
                    legalIdUrl.init();
                    inject(legalIdUrl);
                    legalIdUrl.initFormAttrInternal({
                        container: '.f-legalIdUrl .o-webuploader',
                        keyName: 'legal_id_url',
                        keyValue: data.legal_id_url || ''
                    });
                    legalIdUrl.setStateInternal(data.legal_id_url || '');
                    legalIdUrl.bindInternal();
                    // 运营者身份证背面照
                    legalIdBackUrl = new Uploader({
                        server: '__UPLOAD__',
                        fileVal: 'ufile',
                        pick: {
                            id: '#legal_id_back_url',
                            multiple: false
                        },
                        formData: {
                            bdstoken: GlobalInfo.bdstoken,
                            from_hash: 1,
                            upload_type: 'identity_photo'
                        },
                        fileNumExist: data.legal_id_back_url ? 1 : 0,
                        fileNumLimit: 1
                    });
                    legalIdBackUrl.init();
                    inject(legalIdBackUrl);
                    legalIdBackUrl.initFormAttrInternal({
                        container: '.f-legalIdBackUrl .o-webuploader',
                        keyName: 'legal_id_back_url',
                        keyValue: data.legal_id_back_url || ''
                    });
                    legalIdBackUrl.setStateInternal(data.legal_id_back_url || '');
                    legalIdBackUrl.bindInternal();

                    // 运营者姓名
                    name = new InputField({
                        container: $('.f-name .o-inputfield'),
                        validator: [validator.required, validator.specialChars],
                        validateOnBlur: true,
                        plugins: isOnline ? [
                            new Encoding()
                        ] : [
                            new AutoSave(autoSaveCallback),
                            new Encoding()
                        ]
                    });
                    name.setValue(data.name || '');
                    name.setDefaultValue(data.name || '');
                    // 运营者身份证号
                    legalIdNo = new InputField({
                        container: $('.f-legalIdNo .o-inputfield'),
                        validator: [validator.required, validator.id],
                        validateOnBlur: true,
                        maxLength: 18,
                        plugins: isOnline ? [] : [new AutoSave(autoSaveCallback)]
                    });
                    legalIdNo.setValue(data.legal_id_no || '');
                    legalIdNo.setDefaultValue(data.legal_id_no || '');

                    // 运营邮箱
                    email = new QRField({
                        container: '.f-email',
                        autoSave: !isOnline,
                        validateType: 'email'
                    });
                    email.init(data.email || '');
                    email.setDefaultValue('');
                    // 运营手机号
                    phone = new QRField({
                        container: '.f-phone',
                        autoSave: !isOnline,
                        validateType: 'phone'
                    });
                    phone.init(data.phone || '');
                    phone.setDefaultValue('');

                    // 校验数组
                    Org_Saved_Array['1'] = [
                        slider,
                        busLicUrl,
                        busLicNum,
                        companyName,
                        legalIdUrl,
                        legalIdBackUrl,
                        name, legalIdNo,
                        email, phone
                    ];
                    Org_Saved_Array['2'] = [
                        slider,
                        orgInsUrl,
                        orgInsNum,
                        companyName,
                        legalIdUrl,
                        legalIdBackUrl,
                        name, legalIdNo,
                        email, phone
                    ];

                    setState(String(data.org_type));
                }

                exports.inited = true;
                bind();
            }
        }, 'json');
    }

    /**
     * 设置组织类型,更新页面和相应组件
     * @param {string} orgType
     */
    function setState (orgType) {
        if (orgType === '1') {
            $('.f-busLicUrl').show();
            $('.f-busLicNum').show();
            $('.f-orgInsUrl').hide();
            $('.f-orgInsNum').hide();
            companyName.setState('1');
            state = '1';
        } else if (orgType === '2') {
            $('.f-busLicUrl').hide();
            $('.f-busLicNum').hide();
            $('.f-orgInsUrl').show();
            $('.f-orgInsNum').show();
            companyName.setState('2');
            state = '2';
        }
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
     * 下一步和取消的时候，通过各字段验证后需要执行save操作
     * @returns {Promised}
     */
    function saveAll () {
        //debugger;
        var data = getFormData();
        return $.post(api.zhida.addQua, data);
    }

    /** 绑定事件 */
    function bind () {
        // 切换组织类型
        if (slider) {
            slider.on('valuechange', function (e) {
                if (e.newValue === '1') {
                    setState('1')
                } else if (e.newValue === '2') {
                    setState('2');
                }
            });
        }

        // 点击下一步
        $next.click(function () {
            if (!$next.hasClass('btn-disabled')) {
                if (isSSG) {
                    $view.hide();
                    exports.trigger('step', 2);
                } else {
                    validate(function(result) {
                        if (result === true) {
                            if (isOnline) {
                                $view.hide();
                                exports.trigger('step', 2);
                            } else {
                                saveAll().done(function(data) {
                                    // todo
                                    if (data.error_code) {

                                    } else {
                                        $view.hide();
                                        exports.trigger('step', 2);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });

        // 点击取消
        $cancel.click(function () {
            if (isSSG) {
                history.go(-1);
            } else {
                validate(function (result) {
                    if (result === true) {
                        if (isOnline) {
                            //location.reload();
                            history.go(-1);
                        } else {
                            saveAll().done(function (data) {
                                // todo
                                if (data.error_code) {

                                } else {
                                    //location.reload();
                                    history.go(-1);
                                }
                            });
                        }
                    }
                });
            }
        });

        // 同意
        if ($agree) {
            $agree.change(function () {
                // 得到变化后是否选中
                var checked = $agree[0].checked;
                if (checked) {
                    $next.removeClass('btn-disabled');
                } else {
                    $next.addClass('btn-disabled');
                }
            });
        }
    }

    /**
     * 下一步和取消的时候执行
     * @param {Function} callback
     */
    function validate (callback) {
        $.when(email.validate(), phone.validate()).done(function (emailRet, phoneRet) {
            debugger;

            // 更新各自界面
            email.checkCallback(emailRet);
            phone.checkCallback(phoneRet);
            // 计算各字段验证结果
            emailRet = (emailRet.result === 1) || (emailRet[0].result === 1);
            phoneRet = (phoneRet.result === 1) || (phoneRet[0].result === 1);

            var validArr = state === '1' ? [
                busLicUrl.validate(),
                busLicNum.validate(),
                companyName.validate(),
                legalIdNo.validate(),
                legalIdUrl.validate(),
                legalIdBackUrl.validate(),
                name.validate(),
                emailRet,
                phoneRet
            ] : [
                orgInsUrl.validate(),
                orgInsNum.validate(),
                companyName.validate(),
                legalIdNo.validate(),
                legalIdUrl.validate(),
                legalIdBackUrl.validate(),
                name.validate(),
                emailRet,
                phoneRet
            ];

            var ret = true;
            for (var i = 0; i < validArr.length; ++i) {
                ret = ret && validArr[i];
            }
            callback(ret);
        });
    }

    /**
     * 返回当前需要保存的字段对象
     * @return {Object}
     */
    function getFormData () {
        var data = {};
        var controls = Org_Saved_Array[state];
        for (var i = 0; i < controls.length; ++i) {
            var kv = controls[i].getKeyValue();
            if (kv) {
                data[kv.name] = kv.value;
            }
        }
        data.bdstoken = GlobalInfo.bdstoken;
        return data;
    }

    var exports = {
        inited: inited,
        init: init,
        show: show,
        hide: hide,
        getFormData: getFormData
    };

    EventEmitter.inject(exports);

    return exports;
});