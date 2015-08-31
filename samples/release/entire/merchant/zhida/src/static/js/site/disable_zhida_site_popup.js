/**
 * @fileOverview 下线直达号popup
 */
define([
	'../../../../../../xcom/validator/formvalidator',
    '../../../../../common/js/api',
    '../../../../../common/js/msg'
], function(FormValidator, api, errorMsg){
	'use strict';

	var $ = window.jQuery,
		$popup = $('#disable_site_popup'),
		formValidator,
		vtoken;

	/**
	 * 重置验证码
	 */
	function resetVcode(){
		$.zhida.get(api.zhida.getVcode, function (res) {
            vtoken = res.result.vtoken;
            $('.validate-code').attr('src', res.result.image);
        });
	}

	/**
	 * @module 下线弹窗模块
	 * @type {Object}
	 */
	var popup = {
		init : function(){
			//初始化表单校验器
			var formValidator = new FormValidator($popup);
			//绑定dom事件
			$(document)
				//打开下线直达号popup
				.on('click', '#disable_site_btn', function(){
					if($(this).hasClass('btn-disabled'))return;
					$popup.show();
					//重置验证码图片
					resetVcode();
				});

			$popup
				//关闭下线直达号popup
				.on('click', '.o-popup-close, .cancel-btn', function(){
					$popup.hide();
					//重置表单
					formValidator.reset();
				})
				//确认下线
				.on('click', '.confirm-btn', function(){
					//首先校验表单
					formValidator
					.validate()
					.done(function(){
						$.post(api.zhida.offlineZhida, {
							app_id : GlobalInfo.app_id,
							offline_reason : $.trim($('#disabled_reason').val()),
							just_site : 1,
							input : $.trim($('#validate_code_text').val()),
							vtoken : vtoken
						})
						.done(function(data){
							if(!data.error_code){
								window.location.reload();
							} else {
								if(data.error_code === 305){
									formValidator.items['validate-code'].updateView(false, '验证码输入有误');
									resetVcode();
								} else {
									$popup
										.find('.warning-block')
										.hide()
										.end()
										.find('.page-warning')
										.text(errorMsg.zhida[data.error_code] || errorMsg.defaultMsg)
										.show();
								}
							}
						});
					});
				})
				.on('click', '#change_validate_code', resetVcode);
		}
	};

	return popup;
});