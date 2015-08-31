/**
 * @fileOverview 图片popup查看弹出浮层
 * @author <a href="mailto:langyong@baidu.com">郎勇</a> 2015-07-30T21:45:29+08:00
 * @version 1.0.0
 * @example
 * ImageViewer.init();
 * ImageViewer.open('http://preview.quanjing.com/ibrm042/iblkim01420439.jpg');
 * ImageViewer.on('close', function(picUrl){
 *     //do some thing with this.
 * });
 * 
 */

define([
    '../eventemitter/eventemitter'
], function(EventEmitter) {

    'use strict';

    var domString = '<div class="o-imageviewer-wrapper">' +
                        '<div class="o-imageviewer-mask"></div>' +
                        '<img class="o-imageviewer-pic" />' +
                    '</div>';

    var $viewerWrapper, $pic, $mask;

    var ImageViewer = {
        init : function(){
            if(!$viewerWrapper){
                $viewerWrapper = $(domString);
                $pic = $viewerWrapper.children('.o-imageviewer-pic');
                $mask = $viewerWrapper.children('.o-imageviewer-mask');
                $(document.body).append($viewerWrapper);
                $mask.on('click', function(){
                    ImageViewer.trigger('close', [$pic.attr('src')]);
                    $viewerWrapper.hide();
                });
            }
        },
        open : function(uri){
            var imageObj = new Image();
            imageObj.src = uri;
            imageObj.onload = function(){
                var w = imageObj.width,
                    h = imageObj.height,
                    ratio = w/960>=h/600?w/960:h/600;

                ratio = ratio<1?1:ratio;

                //设置负边距以水平并垂直居中显示
                $pic.css({
                    'margin-left': '-' + (w/ratio)/2 + 'px',
                    'margin-top': '-' + (h/ratio)/2 + 'px'
                });
                $pic.attr('src', uri);
                $viewerWrapper.show();
            };
        },
        close : function(){
            $viewerWrapper.hide();
        },
        destroy: function(){
            this.handlerManager = null;
            $mask.off();
            $viewerWrapper.remove();
            $viewerWrapper = null;
        }
    };

    /**
     * @description mixin event emitter
     */
    EventEmitter.inject(ImageViewer);


    return ImageViewer;
});