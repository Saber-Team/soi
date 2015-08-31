/**
 * @fileoverview 图片相关事件。
 * @email xiongchengbin@baidu.com
 */

define([
    '../../../../../../xcom/imageviewer/imageviewer'
], function (imageViewer) {

    function bindEvent() {
        $('.o-thumbnail-view').on('mouseenter', function () {
            $(this).children('.o-hover').show();
        }).on('mouseleave', function () {
            $(this).children('.o-hover').hide();
        });

        $('.view-origin', '.o-hover').on('click', function () {
            imageViewer.init();
            imageViewer.open($(this).closest('.o-thumbnail-view').children('img').attr('src'));
        });
    }

    return {
        init: bindEvent
    };
});