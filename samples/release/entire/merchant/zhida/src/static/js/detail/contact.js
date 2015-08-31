/**
 * @fileoverview 运营者联系信息相关操作,修改邮箱,修改电话,
 * @email xiongchengbin@baidu.com
 */

define([
    '../../../../../common/js/api',
    '../../../../../common/js/msg'
], function (api, msg) {

    var $editEmailBtn = $('.edit', '.email-info'), //修改邮箱
        $editEmail = $('.email-edit'), //填写新的邮箱地址
        $sendEmail = $('.send-email'), //发送验证码到邮箱
        $email = $sendEmail.prev('input'), //用户输入的邮箱地址
        $fEmail = $('.email-finish'), //保存修改邮箱
        $cEmail = $('.email-cancel'), //取消修改邮箱
        $editMobileBtn = $('.edit', '.mobile-info'), //修改手机
        $editMobile = $('.mobile-edit'), //填写新的手机号码
        $sendMsg = $('.send-msg'), //发送验证码到手机
        $mobile = $sendMsg.prev('input'), //用户输入的手机号码
        $fMobile = $('.mobile-finish'), //保存修改手机
        $cMobile = $('.mobile-cancel'); //取消修改手机

    // 绑定运营者联系信息模块相关事件,修改邮箱,修改手机.
    function bind() {
        var emailInterval = '',
            mobileInterval = '';

        /*修改邮箱相关操作*/
        $editEmailBtn.on('click', function (e) {
            showEmailEdit($(this));
        });

        $sendEmail.on('click', function (e) {
            e.preventDefault();
            // 按钮被禁用或者邮箱未填写或邮箱格式不正确,不进行任何操作.
            if ($(this).hasClass('btn-disabled') || !validate('email')) {
                return false;
            }
            emailInterval = count($(this)); //倒计时,60s后可以重新发送验证码
            post(api.zhida.emailVcode, {email: $email.val()}, function (res){
                //TODO
            });
        });


        //确认修改操作
        $fEmail.on('click', function (e) {
            var $vcode = $editEmail.find('input[type="text"]');
            e.preventDefault();
            //验证邮箱和验证码是否填写, 并校验其格式是否正确
            if (!validate('email') || !validate('vcode', $vcode)) {
                return false;
            }
            post(api.zhida.checkEmailCode, {
                email: $email.val(),
                vcode: $vcode.val()
            }, function (res) {
                if(res.error_code) {
                    showError($vcode, res.error_msg);
                }
                else {
                    $('.email').text(res.data);
                    hideEmailEdit();
                    //清空输入框
                    $email.val('');
                    $vcode.val('');
                    if(emailInterval != '') {
                        clearInterval(emailInterval);
                    }
                    $sendEmail.removeClass('btn-disabled').text('发送验证码');
                }
            });
        });

        //取消修改操作
        $cEmail.on('click', function () {
            hideEmailEdit();
        });
        /*邮箱相关事件结束*/

        /*修改手机号码相关操作*/
        $editMobileBtn.on('click', function (e) {
            showMobileEdit($(this));
        });

        $sendMsg.on('click', function (e) {
            e.preventDefault();

            // 按钮被禁用或者邮箱未填写或邮箱格式不正确,不进行任何操作.
            if ($(this).hasClass('btn-disabled') || !validate('mobile')) {
                return false;
            }

            mobileInterval = count($(this));

            post(api.zhida.phoneVcode, {phone: $mobile.val()}, function (res) {
                //TODO
            });
        });


        $fMobile.on('click', function (e) {
            var $vcode = $editMobile.find('input[type="text"]');
            e.preventDefault();
            if (!validate('mobile') || !validate('vcode', $vcode)) return false;
            post(api.zhida.checkPhoneCode, {
                phone: $mobile.val(),
                vcode: $vcode.val()
            }, function (res) {
                if(res.error_code) {
                    showError($vcode, res.error_msg);
                }
                else {
                    $('.mobile').text(res.data);
                    hideMobileEdit();

                    $mobile.val('');
                    $vcode.val('');
                    if(mobileInterval != '') {
                        clearInterval(mobileInterval);
                    }
                    $sendMsg.removeClass('btn-disabled').text('发送验证码');
                }
            });
        });

        $cMobile.on('click', function (e) {
            hideMobileEdit();
        });
        /*手机相关操作结束*/


        /*输入框聚焦时,隐藏相关的错误信息*/
        $('input').on('focus', function (e) {
            $(this).parent().removeClass('has-error');
        });

    }

    /** 验证输入,包含邮箱,邮箱验证码,手机号码,手机验证码,
     * @param type: 需要验证的字段, 其值为 'email' 'mobile'  'vcode'三者中的一个,
     *              email: 表示验证的是邮箱,
     *              mobile: 表示验证的手机号码
     *              vcode: 表示验证的是验证码,可以是邮箱验证码或者手机验证码
     *        $dom: 字段对应的dom元素, 该字段主要是为了区分手机验证码和邮箱验证码
     *        errorCode: 错误码, 为了兼容后端的返回的错误信息,一般用于ajax提交之后,对错误信息的展示
     */
    function validate(type, $dom, errorCode) {
        /*contactObject  结构说明:
         contactObject = {
         type: { //字段类型  email或mobile或者vcode
         reg: 'xxxx', //用于校验的正则
         val: 'xxxx', //字段的值
         dom: 'xxxx', //对于的dom元素
         msg: { //错误码以及对应的错误信息
         code: 'xxx'
         }
         }
         }
         */
        var contactObject = {
                'email': {
                    'reg': /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
                    'val': $email.val().trim(),
                    'dom': $email,
                    'msg': {
                        0: '请输入邮箱地址',
                        1: '您输入邮箱地址格式不正确,请重新输入'
                    }
                },
                'mobile': {
                    'reg': /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
                    'val': $mobile.val().trim(),
                    'dom': $mobile,
                    'msg': {
                        0: '请输入手机号码',
                        1: '您输入手机号码有误,请重新输入'
                    }
                },
                'vcode': {
                    'reg': /^[0-9]+$/,
                    'val': $dom && $dom.val().trim() || '',
                    'dom': $dom || '',
                    'msg': {
                        0: '请输入验证码',
                        1: '您输入的验证码有误,请重新输入'
                    }
                }
            },
            result = true,
            target = contactObject[type];

        if (!target.val) {
            showError(target.dom, target.msg[0]);
            result = false;
        }
        else if (!target.reg.test(target.val)) {
            showError(target.dom, target.msg[1]);
            result = false;
        }
        else if (errorCode && errorCode != 1) {
            //如果提供错误码,则说明是后端校验之后,发现输入的信息有错误.
            showError(target.dom, target.msg[errorCode]);
            result = false;
        }

        return result;
    }


    function showError($dom, msg) {
        $dom.parent().addClass('has-error').children('.error').text(msg);
    }

    // 点击发送验证码之后, 进行60s倒计时操作,如果60s内没有收到验证码可以重新发送
    function count($target) {
        var time = 60;
        $target.addClass('btn-disabled').text('重新发送(' + time + ')');
        var interval = setInterval(function () {
            time -= 1;
            $target.text('重新发送(' + time + ')');
            if (!time) {
                clearInterval(interval);
                $target.removeClass('btn-disabled').text('重新发送');
            }
        }, 1000);

        return interval;
    }

    //显示或者隐藏必填项图标提示
    function toggleRequired($target, show) {
        $target.closest('.box-row').find('.required').css('visibility', function () { return show ? 'visible': 'hidden';});
    }

    /**
     * 显示编辑邮箱输入框
     * @param $target
     */
    function showEmailEdit($target) {
        $target.parent('.email-info').addClass('hide');
        $editEmail.removeClass('hide')
            .children('.has-error').removeClass('has-error');
        toggleRequired($target, true);
    }

    /**
     * 隐藏编辑邮箱输入框
     */
    function hideEmailEdit() {
        $editEmail.addClass('hide');
        $editEmailBtn.parent('.email-info').removeClass('hide');
        toggleRequired($editEmailBtn);
    }

    /**
     * 显示编辑手机输入框
     * @param $target
     */
    function showMobileEdit($target) {
        $target.parent().addClass('hide');
        $editMobile.removeClass('hide')
            .children('.has-error').removeClass('has-error');
        toggleRequired($target, true);
    }

    /**
     * 隐藏编辑手机输入框
     */
    function hideMobileEdit() {
        $editMobile.addClass('hide');
        $editMobileBtn.parent().removeClass('hide');
        toggleRequired($editMobileBtn);
    }

    //简单封装ajax
    function post(url, data, callback) {
        $.ajax({
            url: url,
            type: 'post',
            data: data,
            success: function (res) {
                callback(res);
            },
            error: function (err) {
                callback(err);
            }
        });
    }


    return {
        init: bind
    }

});