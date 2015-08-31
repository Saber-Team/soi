/**
 * @tooltip, 尽量统一简单, 只做最简单封装, 样式复用`./tooltip.css`
 * @email shanli@baidu.com
 */

define(function() {

    'use strict';

    var $ = window.jQuery;

    var tooltipTime = null;
    var tooltipCloseTime = null;

    // box-default  t-arrow-default
    var TIP_TPL = '<div class="o-tooltip"><div class="arrow"><em></em><span></span></div>'+
                     '<div class="o-tooltip-content"><div class="o-tip-close-btn">╳</div><div class="o-tooltip-content-text"></div></div></div>';
    /**
     * 类包装
     * @param {Object} config
     * @constructor
     */
     /**
     * 类包装
     * @param {Object} config
     * @param ele 元素选择器
     * @param content tip的内容
     * @param content tip的内容
     * @param isClose 是否需要关闭按钮
     * @param theme 皮肤
     * @param pos tip的显示位置
     * @param eventName 事件名称
     * @param width 宽度
     * @param height 高度
     * @param eventName 事件名称
     * @returns {DropBox}
     */
    function Tooltip(config) {
        this.box = TIP_TPL;
        this.sourceEle = config.ele;
        this.content = config.content;
        this.isClose = config.isClose ? config.isClose : false;
        this.theme = config.theme ? config.theme : 'defalut';
        this.pos = config.pos ? config.pos : 't';
        this.eventName = config.eventName ? config.eventName : 'hover';
        this.width = (config.width && config.width > 0) ? config.width : 150;
        this.height = (config.height && config.height > 0) ? config.height : 30;
        this.init();

    }

    $.extend(Tooltip.prototype, {
        init: function(){
            var that = this;
                that.bindEvent(this.sourceEle);
        },
        bindEvent: function($ele){
            var that = this;
            if (!this.eventName){
                that.$target = $($ele);
                that.setOptions($($ele));
            } else if (this.eventName == "hover"){
                $(document).on('mouseenter', $ele, function(e){
                    var el = $(this);
                    that.$target = el;
                    if (tooltipTime){
                        clearTimeout(tooltipTime);
                        tooltipTime = null;
                    }
                    tooltipTime = setTimeout(function(){
                        that.setOptions(el);
                    },300);
                }).on('mouseleave', $ele, function(e){
                    var el = $(this),
                        relatedTarget = $(e.relatedTarget),
                        box  = $(that.$container);
                        that.$target = el;
                    if (!$.contains(box[0],relatedTarget[0])){
                        if (tooltipCloseTime){
                            clearTimeout(tooltipCloseTime);
                            tooltipCloseTime = null;
                        }
                        tooltipCloseTime = setTimeout(function(){
                                that.close(el);
                        },300);
                    }
                });
            } else {
                $(document).on(this.eventName, $ele,function(e){
                    e && e.preventDefault();
                    e && e.stopPropagation();
                    var el = $(this);
                    that.$target = el;
                    that.setOptions(el);
                });
            }
            return this;
        },
        setOptions: function($ele){
            console.log(this.pos,this.theme);
            if (this.$container){
                this.setTheme(this.pos,this.theme)
                    .setPosition($ele,this.pos)
                    .show();
                return this;
            } else {
                this.create()
                    .setTheme(this.pos,this.theme)
                    .setClose()
                    .setContent()
                    .setWidth()
                    .setHeight()
                    .setPosition($ele,this.pos)
                    .show();
            }
            return this;
        },
        setTheme: function(pos,theme){
            console.log(pos,theme);
            this.$container.find('.o-tooltip-content').addClass('box-'+theme);
            this.$container.find('.arrow').addClass(pos+'-arrow '+pos+'-arrow-'+theme);
            return this;
        },
        setWidth: function(){
            var that = this;
            this.$container.css({
                // 'width' : that.width
            });
            return this;
        },
        setHeight: function(){
            var that = this;
                this.$container.css({
                    'height' : that.height
                });
                return this;
        },
        setContent: function(){
            var that = this;
            this.$container.find('.o-tooltip-content-text').append(this.content);
            this.$container.find('.o-tooltip-content').css({
                'width': that.width,
                'height': that.height - 20
            })
            return this;
        },
        setClose: function(){
            var that = this;
            if (!this.isClose){
                this.$container.find('.o-tip-close-btn').hide();
            } else {
                this.$container.find('.o-tip-close-btn').on('click',function(e){
                    e && e.preventDefault();
                    e && e.stopPropagation();
                    that.close();
                });
            }
            return this;
        },
        setPosition: function($ele,pos) {
            var that = this,
                type = pos,
                thisContainers = this.$container,
                content = thisContainers.find('.o-tooltip-content'),
                arrow = thisContainers.find('.arrow'),
                conWidth = content.outerWidth(),
                conHeight = content.outerHeight(),
                elePos = $ele.offset(),
                targetWidth = $ele.outerWidth(),
                targetHeight = $ele.outerHeight(),
                arrowWidth = arrow.outerWidth(),
                arrowHeight = arrow.outerHeight();
                console.log($ele[0].getBoundingClientRect());
                if (type === 't'){
                    thisContainers.css({
                        'left': elePos.left - conWidth/2 + targetWidth/2,
                        'top': elePos.top - (conHeight + 20) - arrowHeight/2//20：上下padding为10
                    })
                    thisContainers.find('.arrow').css({
                        'left': conWidth/2 - arrowWidth/2,
                        'top': conHeight + arrowHeight - 2
                    })
                } else if(type == 'tr'){
                    thisContainers.css({
                        'left': elePos.left - conWidth + targetWidth + 10,
                        'top': elePos.top - (conHeight + 20) - arrowHeight/2//20：上下padding为10
                    })
                    thisContainers.find('.arrow').css({
                        'left': conWidth - arrowWidth - 10,
                        'top': conHeight + arrowHeight - 2
                    })
                } else if (type == 'tl'){
                    thisContainers.css({
                        'left': elePos.left - 10,
                        'top': elePos.top - (conHeight + 20) - arrowHeight/2//20：上下padding为10
                    })
                    thisContainers.find('.arrow').css({
                        'left': targetWidth/2,
                        'top': conHeight + arrowHeight - 2
                    })
                } else if (type === 'r'){
                    thisContainers.css({
                        'left': elePos.left + targetWidth + 10,
                        'top': elePos.top - (targetHeight + conHeight)/2
                    })
                    thisContainers.find('.arrow').css({
                        'left': -targetWidth,
                        'top': (conHeight + targetHeight)/2 + 2
                    })
                } else if (type === 'l'){
                    thisContainers.css({
                        'left': elePos.left - conWidth - targetWidth + 2,
                        'top': elePos.top - (targetHeight + conHeight)/2 - 4
                    })
                    thisContainers.find('.arrow').css({
                        'left':  conWidth - 2,
                        'top': (conHeight + targetHeight)/2 + 2
                    })
                } else if (type == 'br'){
                    thisContainers.css({
                        'left': elePos.left - conWidth + targetWidth + 10,
                        'top': elePos.top + targetHeight -5
                    })
                    thisContainers.find('.arrow').css({
                        'left': conWidth - arrowWidth - 10
                    })
                } else if (type == 'bl'){
                    thisContainers.css({
                        'left': elePos.left - 10,
                        'top': elePos.top + targetHeight -5
                    })
                    thisContainers.find('.arrow').css({
                        'left': targetWidth/2
                    })
                } else {
                    thisContainers.css({
                        'left': elePos.left - conWidth/2 + targetWidth/2,
                        'top': elePos.top + targetHeight -5
                    })
                    thisContainers.find('.arrow').css({
                        'left': conWidth/2 - arrowWidth/2
                    })
                }

            return this;
        },
        create: function() {
            if (this.$container){
                return this;
            }
            this.$container = $(this.box).appendTo('body');
            this.containerEvent();
            this.listenWindow();
            return this;
        },
        show: function() {
            this.$container.show();
            return this;
        },
        containerEvent: function(){
            var that = this;
            if (this.eventName == "hover"){
                $(this.$container).on('mouseleave',function(){
                    if (tooltipCloseTime){
                        clearTimeout(tooltipCloseTime);
                        tooltipCloseTime = null;
                    }
                    tooltipCloseTime = setTimeout(function(){
                        that.close();
                    },300);
                });
            }
        },
        listenWindow: function(){
            var that = this;
            $(window).on('resize scroll',function(e){
                if (this.eventName != "hover"){
                    that.setTheme()
                        .setPosition(that.$target,that.pos);
                }
            });
        },
        close: function() {
            this.$container.hide();
        },
        destroy: function() {

        }
    });

    return Tooltip;

});