/**
 * @fileoverview
 * @author Leo.Zhang(zmike86)
 */

require([
        '@util',
        '@events.util',
        '@events.eventType',
        '@dom.util',
        '@string.util',
        '@net.XhrIo',
        'HMT.MSG',
        'HMT.Service'
    ],
    function(util, events, EventType, dom, string, XhrIo, MSG, Service) {

        'use strict';

        // 倒计时
        function loop() {
            if ($getpid.className !== 'disable') {
                $getpid.className = 'disable';
            }
            if (!loop.num) {
                clearTimeout(loop.timer);
                loop.timer = null;
                loop.num = 60;
                $getpid.className = '';
                $getpid.innerHTML = MSG.BUTTON_TEXT;

            } else {
                $getpid.innerHTML = string.subs(MSG.COUNTDOWN, loop.num);
                loop.num--;
                loop.timer = setTimeout(loop, 1000);
            }
        }
        loop.timer = null;
        loop.num = 60;

        // 常量
        var RE_PHONE = /^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/,
            RE_PID = /\d{6}/;
        var disabled = false,
            isSending = false;
        // 保留上一次通过验证的手机号码
        // var phone_number = '';

        // dom缓存
        var $secondary = dom.getElementsByClass('secondary')[0],
            $pnum = dom.getElement('pnum'),
            $getpid = dom.getElement('getpid'),
            $getpid_err = dom.getElement('getpid_err'),
            $pid = dom.getElement('pid'),
            $submit = dom.getElement('submit'),
            $submit_err = dom.getElement('submit_err'),
            $confirm = dom.getElement('confirm');


        // 验证字段
        function checkValid(field) {
            switch (field) {
                case 'number':
                    var phone = $pnum.value;
                    if (string.trim(phone) == '') {
                        $getpid_err.innerHTML = MSG.PHONE_NULL;
                        $getpid_err.style.display = 'block';
                        return false;
                    } else if (!RE_PHONE.test(phone)) {
                        $getpid_err.innerHTML = MSG.PHONE_ERR;
                        $getpid_err.style.display = 'block';
                        return false;
                    } else {
                        $getpid_err.style.display = 'none';
                        return true;
                    }
                    break;
                case 'pid':
                    var pid = $pid.value;
                    if (string.trim(pid) == '') {
                        $submit_err.innerHTML = MSG.PID_NULL;
                        $submit_err.style.display = 'block';
                        return false;
                    } else if (!RE_PID.test(pid)) {
                        $submit_err.innerHTML = MSG.PID_FORMAT_ERR;
                        $submit_err.style.display = 'block';
                        return false;
                    } else {
                        $submit_err.style.display = 'none';
                        return true;
                    }
                    break;
                default :
                    return false;
            }
        }


        // 领完奖置灰页面
        function setDisabled(disable) {
            if (disable) {
                disabled = true;
                $submit.className = 'disable';
                $getpid.className = 'disable';
            } else {
                disabled = false;
                $submit.className = '';
                $getpid.className = '';
            }
        }


        // 绑定事件
        function bind() {
            // 号码输入框失焦
            events.listen($pnum, EventType.BLUR, function (e) {
                var phone = this.value;
                if (string.trim(phone) == '') {
                    $getpid_err.innerHTML = '';
                    $getpid_err.style.display = 'none';
                }
                else if (!RE_PHONE.test(phone)) {
                    $getpid_err.innerHTML = MSG.PHONE_ERR;
                    $getpid_err.style.display = 'block';
                }
            }, false, $pnum);


            // 输入号码时
            events.listen($pnum, EventType.KEYUP, function () {
                var phone = this.value;
                if (string.trim(phone) == '') {
                    $getpid_err.innerHTML = MSG.PHONE_NULL;
                    $getpid_err.style.display = 'block';
                }
                else if (!RE_PHONE.test(phone)) {
                    $getpid_err.innerHTML = MSG.PHONE_ERR;
                    $getpid_err.style.display = 'block';
                }
                else {
                    $getpid_err.innerHTML = '';
                    $getpid_err.style.display = 'none';
                }
            }, false, $pnum);


            // 点获取验证码
            events.listen($getpid, EventType.CLICK, function () {
                if (disabled) return;
                if (isSending) return;
                if (/disable/.test($getpid.className))
                    return;

                var phone = $pnum.value;
                if (checkValid('number')) {
                    isSending = true;
                    // phone_number = phone;
                    // 调用验证码接口
                    Service.getPid(function(e) {
                        var xhrio = e.target;
                        var ret = xhrio.getResponseText() - 0;
                        // 成功
                        if (ret === 1) {
                            loop();
                        }
                        // 已无验证码
                        else if (ret === 0) {
                            $getpid_err.innerHTML = MSG.NO_PID;
                            $getpid_err.style.display = 'block';
                        }
                        // 此手机已领取优惠码
                        else if (ret === -1) {
                            $getpid_err.innerHTML = MSG.DUP;
                            $getpid_err.style.display = 'block';
                        }
                        // 服务器错误
                        else if (ret === -2) {
                            $getpid_err.innerHTML = MSG.SERVER_ERR;
                            $getpid_err.style.display = 'block';
                        }
                        // 其他情况
                        else {
                            $getpid_err.innerHTML = MSG.SERVER_ERR;
                            $getpid_err.style.display = 'block';
                        }

                        isSending = false;

                    }, phone);
                }
            }, false, $getpid);


            // 提交验证码
            events.listen($submit, EventType.CLICK, function () {
                if (disabled) return;
                if (isSending) return;
                if (/disable/.test($submit.className)) return;

                var phone = $pnum.value;
                var pid = $pid.value;
                if (checkValid('number') && checkValid('pid')) {
                    isSending = true;
                    // 调用提交接口
                    Service.sendPid(function(e) {
                        var xhrio = e.target;
                        var ret = xhrio.getResponseText() - 0;
                        // 成功
                        if (ret == 1) {
                            $secondary.style.display = 'block';
                        }
                        // 验证失败
                        else if (ret == -1) {
                            $submit_err.innerHTML = MSG.PID_ERR;
                            $submit_err.style.display = 'block';
                        }
                        // 服务器错误
                        else if (ret == -2) {
                            $submit_err.innerHTML = MSG.SERVER_ERR;
                            $submit_err.style.display = 'block';
                        }

                        isSending = false;

                    }, phone, pid);
                }
            }, false, $submit);


            // 点确定
            events.listen($confirm, EventType.CLICK, function() {
                $secondary.style.display = 'none';
                setDisabled(true);
            }, false, $confirm)
        }

        // go
        bind();

    }
);