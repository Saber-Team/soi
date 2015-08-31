/**
 * @fileoverview 引导第三步
 * @email zhangshen04@baidu.com
 *
 * mrd: 如果直达站点已上线，则隐藏开店/建站的引导；
 *      如果直达站点还未提交，则保留开店/建站的引导；
 *      如果直达站点审核不通过，单击“去开店/建站”button则跳转至商户后台直达站点设置页面
 */

define([
    '../../../../../../common/js/api',
    './inform'
], function (api, inform) {

    'use strict';

    var $ = window.jQuery;

    // dom
    var $view;
    var $build;

    // 是否已经初始化
    var inited = false;
    // 这个状态是指的站点状态，并非主体状态qua_status
    var isOnline = false;

    /**
     * 初始化操作
     * @param {boolean} isShow 是否显示第一步界面
     */
    function init (isShow) {
        isShow = !!isShow;

        // dom
        $view = $('.step-3');
        $build = $view.find('.builder button');

        if (isShow) {
            show();
        }

        isOnline = (Number(GlobalInfo.site_status) >= 4);
        if (isOnline && Number(GlobalInfo.site_status) !== 7) {
            $build.hide();
        }

        inform.init();
        inform.setInformation(GlobalInfo.email || '', GlobalInfo.phone || '');

        exports.inited = true;
        bind();
    }

    /** 事件绑定 */
    function bind () {
        // 提交
        $build.click(function () {
            // 如果直达站点审核不通过，单击“去开店/建站”button
            // 则跳转至商户后台直达站点设置页面
            if (GlobalInfo.site_status === '3'
                || GlobalInfo.site_status === '7') {
                location.href = '/sh/site/detail';
            } else {
                location.href = 'http://cq01-lapp07.epc.baidu.com:8241/solution?sid=' + GlobalInfo.sid;
                // location.href = 'http://zhida.baidu.com/hangyefangan?zhida_refer=' + encodeURIComponent(location.href);
            }
        });
    }

    /** 展示 */
    function show () {
        $view.show();
    }

    /** 隐藏 */
    function hide () {
        $view.hide();
    }

    var exports = {
        inited: inited,
        init: init,
        show: show,
        hide: hide
    };

    return exports;
});