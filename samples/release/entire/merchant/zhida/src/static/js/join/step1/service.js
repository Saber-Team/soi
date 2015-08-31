/**
 * @fileoverview 验证码相关服务请求封装
 * @email zhangshen04@baidu.com
 */

define([
    '../../../../../../common/js/api'
], function(api) {

    'use strict';

    /**
     * 向手机发送验证码
     * @param {string} phone
     */
    function requestPhoneQRcode(phone) {
        $.post(api.zhida.phoneVcode, {
            phone: String(phone)
        }, function(data) {

        }, 'json');
    }

    /**
     * 向邮箱发送验证码
     * @param {string} email
     */
    function requestEmailQRcode(email) {
        $.post(api.zhida.emailVcode, {
            email: String(email)
        }, function(data) {

        }, 'json');
    }

    /**
     * 验证码是否正确
     * @param {string} email
     * @param {string} vcode
     * @return {Promise}
     */
    function checkEmailVcode(email, vcode) {
        return $.post(api.zhida.checkEmailCode, {
            email: String(email),
            vcode: String(vcode)
        }, 'json');
    }

    /**
     * 短信验证码是否正确
     * @param {string} phone
     * @param {string} vcode
     * @return {Promise}
     */
    function checkPhoneVcode(phone, vcode) {
        return $.post(api.zhida.checkPhoneCode, {
            phone: String(phone),
            vcode: String(vcode),
            bdstoken: GlobalInfo.bdstoken
        }, 'json');
    }

    return {
        requestPhoneQRcode: requestPhoneQRcode,
        requestEmailQRcode: requestEmailQRcode,
        checkEmailVcode: checkEmailVcode,
        checkPhoneVcode: checkPhoneVcode
    };
});