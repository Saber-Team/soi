/**
 * @fileoverview
 * @email zhangshen04@baidu.com
 */

define([
    './previewDialog'
], function (previewDialog) {

    'use strict';

    var $ = window.jQuery;
    var $p;

    function setInformation (email, phone) {
        $p.html('审核结果将在3个工作日内以邮件（' + email + '）短信（' + phone + '）<br/>' +
        '系统消息的方式通知到您，请注意查收。<span>查看预览效果</span>')
    }

    function init () {
        $p = $('.step-3 .inform p');
        bind();

        previewDialog.init();
    }

    function bind () {
        $('.step-3 .inform').delegate('span', 'click', function () {
            previewDialog.show();
        });
    }

    return {
        init: init,
        setInformation: setInformation
    };
});