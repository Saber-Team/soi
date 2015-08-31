/**
 * @fileoverview 资质审核不通过的提示信息
 * @email zhangshen04@baidu.com
 */

define(function (require, exports, module) {

    'use strict';

    var $ = window.jQuery;
    var $container;
    var $content;

    function init(msg) {
        $container = $('.step-2 .warning');
        $content = $container.find('p');
        $content.html(msg);
    }

    function show() {
        $container.show()
    }

    function hide() {
        $container.hide()
    }

    module.exports = {
        init: init,
        show: show,
        hide: hide
    }
});