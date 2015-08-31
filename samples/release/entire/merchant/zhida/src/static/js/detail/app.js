/**
 * @fileoverview 展示直达号以及直达站点的信息,并根据不同状态提供编辑入口。
 * @email xiongchengbin@baidu.com
 */

require([
    '../../../../../../xcom/tooltip/tooltip',
    '../../../../../common/js/api',
    './enterprise',
    './contact',
    './remove_zhida',
    './image_events'
], function(Tooltip, api, enterprise, contact, removeZhida, imageEvents) {
    enterprise.bindEvent();
    contact.init();

    removeZhida.init();

    imageEvents.init();


    if ($('.btn-offline').length) {
        new Tooltip({
            ele: '.btn-right .btn-disabled.btn-offline',
            content: '直达号已下线，无法修改',
            eventName: 'hover',
            pos: 'b',
            height: 40,
            width: 140,
            theme: 'default'
        });
    }
});