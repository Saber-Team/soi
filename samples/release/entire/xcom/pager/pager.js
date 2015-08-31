/**
 * @tooltip, 尽量统一简单, 只做最简单封装, 样式复用`./tooltip.css`
 * @email shanli@baidu.com
 */

define(function() {

    'use strict';

    var $ = window.jQuery;

    /**
     * 类包装
     * @param {Object} config
     * @constructor
     */
    function Pager(config) {
        this.container = config.container ? config.container : '.page-box';
        this.currentPage = (config.currentPage && config.currentPage > 0) ? config.currentPage : 1;
        this.totalCount = (config.totalCount && config.totalCount > 0) ? config.totalCount : 0;
        this.pageSize = (config.pageSize && config.pageSize > 0) ? config.pageSize : 20;
        this.prevPage = 1;
        // 保存订阅事件
        this.handlerManager = {};
        this.pageTpl = '';
        this.pageArray = [];

        this.bindEvent()
            .dispatchEvent();
    }

    $.extend(Pager.prototype, {
        init: function(){
            if (this.totalCount <= this.pageSize){
                return this;
            }
            this.totalPage = Math.ceil(this.totalCount/this.pageSize);
            this.computePage()
                .render();
            return this;
        },
        computePage: function() {
            var i, j, k;
            var that = this;
            this.pageArray = [];
            this.pageArray.push("1");
            if(this.totalPage > 0 && this.totalPage <= 8){
                for (i = 2; i <= this.totalPage - 1; i++) {
                    that.pageArray.push(i);
                }
            } else if (this.currentPage <= 4) {
                for(j = 2; j <= 6; j++) {
                    that.pageArray.push(j);
                }
                this.pageArray.push("...");
            } else if ((this.totalPage-this.currentPage) <= 3) {
                this.pageArray.push("...");
                for (k = this.totalPage - 5; k <= this.totalPage - 1; k++) {
                    that.pageArray.push(k);
                }
            } else {
                this.pageArray.push("...");
                this.pageArray.push(this.currentPage-1);
                this.pageArray.push(this.currentPage);
                this.pageArray.push(this.currentPage+1);
                this.pageArray.push(this.currentPage+2);
                this.pageArray.push("...");
            }
            this.pageArray.push(this.totalPage);
            return this;
        },
        render: function() {
            var that = this;
                that.pageTpl = '';
            if (this.currentPage != 1){
                that.pageTpl += '<a class="pageitem page-pre" href="javascript:;">&lt;</a>';
            }
            var pageLength = this.pageArray.length;
            for(var pageIndex = 0; pageIndex < pageLength; pageIndex++){
                var cls = 'pageitem page-num page-start';
                if (pageIndex >  0){
                    cls += ' no-left';
                }
                var key = pageIndex+1;
                if(this.currentPage == that.pageArray[pageIndex]){
                    cls += ' active';
                }
                that.pageTpl += '<a href="javascript:;" class="'+cls+'">'+that.pageArray[pageIndex]+'</a>';
            }
            if (this.currentPage != this.totalPage){
                that.pageTpl += '<a class="pageitem page-next" href="javascript:;">&gt;</a>';
            }
            that.pageTpl = '<div class="o-pagenav">'+that.pageTpl+'</div>';
            $(this.container).html(that.pageTpl);
            return this;
        },
        reRender: function(totalCount, currentPage) {
            this.totalCount = totalCount;
            if (this.totalCount <= this.pageSize) {
                $(this.container).html('');
                return this;
            }
            this.totalPage = Math.ceil(this.totalCount / this.pageSize);
            this.prevPage = this.currentPage;
            if (currentPage) {
                this.currentPage = currentPage;
            }
            this.computePage().render();
        },
        prev: function() {
            this.prevPage = this.currentPage;
            this.currentPage--;
            this.computePage();
            this.render();
            this.dispatchEvent();
            return this;
        },
        next: function() {
            this.prevPage = this.currentPage;
            this.currentPage++;
            this.computePage();
            this.render();
            this.dispatchEvent();
            return this;
        },
        select: function(currentPage) {
            this.prevPage = this.currentPage;
            this.currentPage = currentPage;
            this.computePage();
            this.render();
            this.dispatchEvent();
            return this;
        },
        /**
         * 订阅事件
         * @param {string} eventName
         * @param {function} handler
         * @param {*} ctx
         * @returns {Pager}
         */
        on: function(eventName, handler, ctx) {
            if (!this.handlerManager[eventName]) {
                this.handlerManager[eventName] = [];
            }
            this.handlerManager[eventName].push({
                handler: handler,
                ctx: ctx
            });
            return this;
        },

        /**
         * 触发事件
         * @param {string} eventName
         * @param {*} args
         */
        trigger: function(eventName, args) {
            if (!this.handlerManager[eventName]) {
                return this;
            }
            args = Array.prototype.slice.call(arguments, 1);
            var handles = this.handlerManager[eventName];
            for (var i = 0; i < handles.length; ++i) {
                handles[i].handler.apply(handles[i].ctx, args);
            }
        },
        dispatchEvent: function() {
            this.trigger('pagechange', {
                oldValue: this.prevPage,
                newValue: this.currentPage
            });
            return this;
        },
        bindEvent: function() {
            var that = this;
            $(that.container).on('click','.pageitem', function(e){
                var page = $(this);
                if (page.hasClass('page-pre')){
                    that.prev();
                } else if (page.hasClass('page-next')){
                    that.next();
                } else {
                    var pageText = page.text();
                    if (pageText != "..."){
                        that.select(parseInt(pageText));
                    }
                }
            });
            return this;
        },
        destroy: function() {

        }
    });

    return Pager;

});