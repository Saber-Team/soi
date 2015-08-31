/**
 * 所有服务端api接口
 */

define('merchant:common:api', function() {

    'use strict';

    var apiDomain = '__APIDOMAIN__';

    return {
        crm: {
            areaList: 'http://map.baidu.com/?qt=sub_area_list',
            customerList: apiDomain + 'zhidahao/v1/crm/customer/list',
            customerDetail: apiDomain + 'zhidahao/v1/crm/customer/detail',
            groupList: apiDomain + 'zhidahao/v1/crm/customer/group/list',
            updateGroup: apiDomain + 'zhidahao/v1/crm/customer/group/update',
            deleteGroup: apiDomain + 'zhidahao/v1/crm/customer/group/delete',
            createGroup: apiDomain + 'zhidahao/v1/crm/customer/group/create',
            updateRemark: apiDomain + 'zhidahao/v1/crm/customer/interpose',
            addToGroup: apiDomain + 'zhidahao/v1/crm/customer/group/bind'
        },
        deal: {
            listPage: apiDomain + 'sh/deposit',
            infoPage: apiDomain + 'sh/deposit/detail',
            sign: apiDomain + 'sh/deposit/updateiset',
            list: apiDomain + 'sh/deposit/list',
            info: apiDomain + 'sh/deposit/info',
            rollout: apiDomain + 'sh/deposit/out',
            recharge: apiDomain + 'sh/deposit/in',
            pay: apiDomain + 'sh/deposit/order',
            getCode: apiDomain + 'sh/deposit/order/qr',
            cancel: apiDomain + 'sh/deposit/order/cancel',
            check: apiDomain + 'sh/deposit/order/check'
        },
        zhida: {
            getQua: apiDomain + 'sh/zhida/qua/get',
            updateQua: apiDomain + 'sh/zhida/qua/update',
            addQua: apiDomain + 'sh/zhida/qua/add',

            storeQua: apiDomain + 'rest/2.0/zhidahao/v1/agent/submitstorequainfo',
            saveQua: apiDomain + 'rest/2.0/zhidahao/v1/agent/savestorequainfo',
            sendSmsVcode: apiDomain + 'rest/2.0/zhidahao/v1/agent/sendsmsvcode',
            verifySmsVcode: apiDomain + 'rest/2.0/zhidahao/v1/agent/verifysmsvcode',
            sendEmailVcode: apiDomain + 'rest/2.0/zhidahao/v1/agent/sendemailvcode',
            verifyEmailVcode: apiDomain + 'rest/2.0/zhidahao/v1/agent/verifyemailvcode',

            phoneVcode: apiDomain + 'sh/zhida/send/vcode',
            emailVcode: apiDomain + 'sh/zhida/send/email_vcode',
            checkPhoneCode: apiDomain + 'sh/zhida/check/vcode',
            checkEmailCode: apiDomain + 'sh/zhida/check/email_vcode',

            offlineZhida: apiDomain + 'sh/zhida/offline',
            submitZhidaSite: apiDomain + 'sh/zhida/set_site/submit',
            saveZhidaSite: apiDomain + 'sh/zhida/set_site/save',
            verifyZhidaSite: apiDomain + 'sh/zhida/verify_site',

            getZhidaInfo: apiDomain + 'sh/zhida/info',
            updateZhidaInfo: apiDomain + 'sh/zhida/update',
            addZhidaInfo: apiDomain + 'sh/zhida/add',
            addQuaAndZhida: apiDomain + 'sh/zhida/qua/zhida/add',

            getVcode: apiDomain + 'sh/vcode/create',
            checkVcode: apiDomain + 'sh/vcode/verify'
        }
    };
});