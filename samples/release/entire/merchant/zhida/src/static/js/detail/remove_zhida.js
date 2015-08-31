/**
 * @fileoverview 下线直达号。
 * @email xiongchengbin@baidu.com
 */

define([
    '../../../../../common/js/api'
], function (api) {
    var $remBtn = $('.btn-remove'),
        $popup = $('.popup'),
        $vcode = $('.vcode'),
        $reason = $('.disabled-reason'),
        vtoken = '';

    function bindEvents() {
        $remBtn.on('click', function (e) {
            e.preventDefault();
            if ($(this).hasClass('btn-disabled')) return false;

            getVcode(); //初始化验证码
            $popup.find('.has-error').removeClass('has-error');
            toggleDialog(true);
        });

        $('.cancel-btn, .popup-close').on ('click', function () {
            toggleDialog(false);
            resetForm(); //清空表单内容
        });

        $('.confirm-btn').on('click', function (e) {
            e.preventDefault();

            if(!validateForm()) {
                return false;
            }

            offline();

        });

        $('.refresh-code, .validate-code').on('click', function (e) {
            e.preventDefault();
            getVcode();
        });

        $reason.on('focus', function () {
            $(this).parent().removeClass('has-error');
        })
    }

    /**
     * 获取验证码
     */
    function getVcode() {
        $.get(api.zhida.getVcode, function (res) {
            vtoken = res.result.vtoken;
            $('.validate-code').attr('src', res.result.image);
        });
    }

    /**
     * 验证输入是否正确
     */
    function validateForm () {
        if (!$vcode.val()) {
            showError('null');
            return false;
        }

        if ($vcode.val().trim().length != 4) {
            showError('wrong');
            return false;
        }

        if (!$reason.val()) {
            $reason.parent().addClass('has-error').children('.error').text('请输入下线原因');
            return false;
        }
        else if ($reason.val().length > 512) {
            $reason.parent().addClass('has-error').children('.error').text('下线原因最多可为512个字符');
            return false;
        }

        return true;

    }

    /**
     * 下线直达号
     */
    function offline () {
        $.post(api.zhida.offlineZhida, {
            "app_id": Info.app_id,
            "offline_reason": $reason.val(),
            "input": $vcode.val(),
            "vtoken": vtoken
        }, function (res) {
            if(res.error_code && res.error_code != 305) {
                $('.warning', '.popup-body').slideUp();
                $('.error-box', '.popup-body').slideDown().find('.text').text(res.error_msg);
                getVcode();
            }
            else if (res.error_code && res.error_code == 305) {
                showError('wrong');
                getVcode();
            }
            else {
                toggleDialog();
                window.location.reload();
            }
        });
    }


    /**
     * 展示错误
     * @param type {string}: 验证码为空,或者验证码不正确
     */
    function showError (type) {
        var message = {
            'null': '请输入验证码',
            'wrong': '验证码不正确,请重新输入'
        };
        $vcode.parent().addClass('has-error').children('.error').text(message[type]);
    }


    /** 显示或者隐藏浮层
     *  @ param {boolean} isShow: 显示浮层?, 为true时显示,否则隐藏
     */
    function toggleDialog(isShow) {
        isShow ? $popup.show() : $popup.hide();
    }

    /**
     * 清空表单,避免用户打开浮层, 取消, 再次打开保留上传输入的内容
     */
    function resetForm() {
        $vcode.val('');
        $reason.val('');
    }


    return {
        init: bindEvents
    };
});
