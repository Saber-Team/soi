/**
 * @dialog, 尽量统一简单, 只做最简单封装, 样式复用`./dialog.css`
 * @email shanli@baidu.com
 */

define(function() {

    'use strict';

    var $ = window.jQuery;


    function getGenrateRandomId(){
        return Math.round(Math.random()*10000).toString(16);
    }

    var DialogPools = {};


    var DIALOG_TPL = '<div class="o-dialog-container">' +
                    '<div class="o-background"></div>' +
                    '<div class="o-dialog">' +
                    '<div class="o-close-btn">╳</div>' +
                    '<div class="o-dialog-title"></div>' +
                    '<div class="o-dialog-body"></div>' +
                    '<div class="o-dialog-buttons"></div>' +
                    '</div></div>';

    /**
     * 类包装
     * @param {Object} config
     * @constructor
     */
    function Dialog(config) {
        this.dialogBox = DIALOG_TPL;
        this.width = config.width;
        this.height = config.height;
        this.id = config.id ? config.id : 'o-dialog-'+getGenrateRandomId();
        this.dialogTitle = config.title;
        this.dialogContent = config.content;
        this.dialogButton = config.button;
        this.isCloseBtn = config.isClose ? config.isClose : true;
    }

    $.extend(Dialog.prototype, {
        init: function(){
            this.create()
                .setWidth(this.width)
                .setHeight(this.height)
                .setClose()
                .setTitle(this.dialogTitle)
                .setContent(this.dialogContent)
                .setButtons(this.dialogButton)
                .resizeBack()
                .resetPos()
                .show();
            return this;
        },
        setTitle: function(title) {
            if (this.dialogTitle){
                this.$container.find('.o-dialog-title').html(title);
            } else {
                this.$container.find('.o-dialog-title').hide();
            }
            return this;
        },
        setContent: function(content){
            this.$container.find('.o-dialog-body').html(content);
            return this;
        },
        setButtons: function(buttons) {
            var that = this;
            if (buttons && buttons.length){
                $.each(buttons,function(index ,item){
                    var thisBtn = $('<a class="btn-38 btn-'+item.theme+' btn-mr20" href="javascript:;">'+item.text+'</a>')
                                    .appendTo(that.$container.find('.o-dialog-buttons'));
                        that.bindEvent($(thisBtn), item.callback);
                });
            }
            return that;
        },
        setClose: function(){
            var that = this;
            if (!this.isCloseBtn){
                this.$container.find('.o-close-btn').hide();
            } else {
                this.$container.find('.o-close-btn').on('click',function(){
                    that.close();
                });
            }
            return this;
        },
        resizeBack: function(){
            var that = this,
                win = $(window);
                win.on('scroll,resize',function(){
                    that.$container.find('.o-background').css({
                        "height" : win.height() + win.scrollTop()
                    })
                });
                return that;
        },
        resetPos: function(){
            var that = this,
                win = $(window),
                $dialog = this.$dialog,
                _posiTop = 0,
                _posiLeft = 0,
                size = {};
                win.on('resize',function(){
                    size = that.getViewPortSize();
                    _posiTop = ((size.height - that.$dialog.height()) >> 1);
                    _posiLeft = ((size.width - that.$dialog.width()) >> 1);
                    // 设置position
                    $dialog.css({
                        "left": _posiLeft + "px",
                        "top":_posiTop + "px"
                    });
                });
                return this;
        },
        bindEvent: function(btn,callback){
            var that = this;
                if (btn && btn.length){
                    btn.on('click',function(){
                        callback.call(btn,that);
                    })
                }
            return that;
        },
        create: function() {
            var win = $(window),
                body = $('body'),
                that = this;
                this.$container = $(this.dialogBox);
                this.$dialog = this.$container.find('.o-dialog');
                $(this.$container).appendTo(body);
            return this;
        },
        setWidth: function(width){
            this.$dialog.css({
                "width": width
            });
            return this;
        },
        setHeight: function(height){
            this.$dialog.css({
                "height": height
            });
            return this;
        },
        /**
         * 获取视口尺寸
         * @return {Object}
         */
        getViewPortSize: function() {
            var isCompatMode = document.compatMode === "CSS1Compat";
            var el = isCompatMode ? document.documentElement : document.body;
            return {
                width: el.clientWidth,
                height: el.clientHeight
            };
        },
        show: function() {
            var that = this,
                win = $(window),
                _posiTop = 0,
                _posiLeft = 0,
                scrollTop = win.scrollTop(),
                $dialog = this.$dialog,
                size = this.getViewPortSize();
            _posiTop = ((size.height - this.$dialog.height()) >> 1);
            _posiLeft = ((size.width - this.$dialog.width()) >> 1);
            // 设置position
            $dialog.css({
                "left": _posiLeft + "px",
                "top":_posiTop + "px"
            });
            this.$container.css({
                display: 'block'
            })
        },
        close: function() {
            this.$container.hide();
        },
        destroy: function() {

        }
    });

    Dialog.getInstanceById = function(id) {
        return DialogPools[id] || null;
    };

    return Dialog;

});