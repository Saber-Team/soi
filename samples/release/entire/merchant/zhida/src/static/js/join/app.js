/**
 * @fileoverview 直达号引导页面，
 * @email zhangshen04@baidu.com
 */

require([
    '../../../../../common/js/utils',
    './step1/main',
    './step2/main',
    './step3/main'
], function (utils, step1, step2, step3) {

    'use strict';

    // 先检查是否登陆
    if (GlobalInfo.islogin !== '1') {
        utils.checkLogin();
    }

    // 判断当前第几步
    if (GlobalInfo.step === '1') {
        step1.init(true);
    } else if (GlobalInfo.step === '2') {
        step1.init(false);
        step2.init(true);
    } else if (GlobalInfo.step === '3') {
        step3.init(true);
    }

    // 事件绑定
    step1.on('step', function (step) {
        if (step === 2) {
            step1.hide();
            if (step2.inited) {
                step2.show();
            } else {
                step2.init(true);
            }
        }
    });

    step1.on('bind:ssg', function (isSSG) {
        step2.setSSG(isSSG);
    });

    step2.on('step', function (step) {
        if (step === 1) {
            step2.hide();
            if (step1.inited) {
                step1.show();
            } else {
                step1.init(true);
            }
        }
    });
});