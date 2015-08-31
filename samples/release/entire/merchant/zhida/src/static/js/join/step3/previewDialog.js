/**
 * @fileoverview
 * @email zhangshen04@baidu.com
 */

define(['../../../../../../common/js/api'], function (api) {

    'use strict';

    var $ = window.jQuery;
    var template =
        '<div id="step-3-sample-container" class="hide">' +
            '<div class="step-3-sample-mask"></div>' +
            '<div class="step-3-sample">' +
                '<h3>查看预览效果</h3><span class="close">×</span>' +
                '<div class="frame-border">' +
                    '<img src="" />' +
                    '<div class="frame"></div>' +
                    '<div class="text-ellipsis query"></div>' +
                    '<div class="summary"></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    var $container;
    var $close;
    var $icon;
    var $query;
    var $summary;

    /**
     * 设置数据源
     * @param {Object} data
     */
    function setData (data) {
        $icon.attr('src', data.logo);
        $query.text(data.query);
        $summary.text(data.summary);
    }

    function show () {
        $container.show();
    }

    function hide () {
        $container.hide();
    }

    function init () {
        var frag = document.createDocumentFragment();
        $(template).appendTo(frag);
        document.body.appendChild(frag);

        $container = $('#step-3-sample-container');
        $close = $container.find('.close');
        $icon = $container.find('img');
        $query = $container.find('.query');
        $summary = $container.find('.summary');

        bind();

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
                setData({
                    logo: data.logo90 || '',
                    query: data.query || '',
                    summary: data.summary || ''
                });
            }
        });
    }

    function bind () {
        $close.click(function () {
            hide();
        });
    }

    return {
        init: init,
        hide: hide,
        show: show
    }
});