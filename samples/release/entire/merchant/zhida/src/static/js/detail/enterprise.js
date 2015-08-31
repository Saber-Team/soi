/**
 * @fileoverview 资质信息相关操作,展开详情,收起详情,
 * @email xiongchengbin@baidu.com
 */

define(['../../../../../../xcom/tooltip/tooltip'],
    function (Tooltip) {
        'use strict';

        var $toggle = $('.toggle');

        //无法修改提示
        if ($('.btn-disabled.btn-edit', '.btn-right').length){
            new Tooltip({
                ele: '.btn-right .btn-disabled.btn-edit',
                content: '审核中无法修改',
                eventName: 'hover',
                pos: 'b',
                height: 40,
                width: 90,
                theme: 'default'
            });
        }

        if ($('.btn-disabled.btn-remove', '.btn-right')) {
            new Tooltip({
                ele: '.btn-right .btn-disabled.btn-remove',
                content: '审核中无法下线',
                eventName: 'hover',
                pos: 'b',
                height: 40,
                width: 90,
                theme: 'default'
            });
        }




        function bind() {
            $toggle.on('click', function (e) {
                var that = this,
                    $that = $(that),
                    $info = $('.more', '.enterprise');

                if ($that.hasClass('show-more')) {
                    $info.slideDown();
                    $that.text('收起详情');
                }
                else {
                    $info.slideUp();
                    $that.text('展开详情');
                }

                $that.toggleClass('show-more hide-more');
            });


            $('a.btn-disabled', '.enterprise').on('click', function (e) {
                e.preventDefault();
                return false;
            }).on('mouseenter', function (e) {
                
            });

        }

        return {
            bindEvent: bind
        };
    });