/**
 * @fileOverview 验证所有权popup
 */

define([
	'./clipboard',
	'./page_form_validator',
    '../../../../../common/js/api'
], function(clipboard, formValidator, api){
	'use strict';

	var $ = window.jQuery,
		$popup = $('#verify_ownership_popup');

	var popup = {
		init : function(){
			$(document)
				//打开验证所有权popup
				.on('click', '#verify_ownership_btn', function(){
					formValidator
						.items['app_url']
						//只校验两种规则
						.validate(false, ['required', 'website'])
						.done(function(){
							$popup.show();
							clipboard.setCopyAction($('#copy_code_btn'));
						});
				});

			$popup
				//关闭验证所有权popup
				.on('click', '.o-popup-close, .cancel-btn', function(){
					$popup.hide();
					clipboard.cancelCopyAction($('#copy_code_btn'));
				})
				.on('click', '.confirm-btn', function(){
					var $appUrlInput = $('#app_url_input'),
						$appUrlText = $('#app_url_text'),
						appUrl = $appUrlInput.val();

					if(!/https?:\/\//.test(appUrl)){
						appUrl = 'http://' + appUrl;
						$appUrlInput.val(appUrl);
					}
						
					$.zhida.post(api.zhida.verifyZhidaSite, {
						app_id : GlobalInfo.app_id,
						app_url : appUrl
					}).done(function(data){
						if(data.result){
							//如果站点所有权验证成功，隐藏『10分钟建站引导』
							$('#leading_to_builder_tip').hide();
							//展现验证成功提示
							$('#ownership_verify_success').show();
							//隐藏验证失败提示
							formValidator.items['app_url'].updateView(true);
							$appUrlInput.data('appUrlStatus', 1);
							$appUrlInput.data('createType', 1);
							//隐藏站点地址输入框
							$appUrlInput.hide();
							//隐藏验证所有权按钮
							$('#verify_ownership_btn').hide();
							//隐藏验证必看链接
							$('#verify_read_link').hide();
							//展现站点地址文本
							$('#app_url_text').text(appUrl).show();
							//展现接入直达号订单、更换站点地址链接
							$('#site_notice_4').show();
							$('#site_notice_1').show();
							//隐藏完善店铺链接
							$('#site_notice_2').hide();
						} else {
							$('#ownership_verify_success').hide();
							$appUrlInput.data('appUrlStatus', 2);
							formValidator.items['app_url'].validate();
						}
						$popup.hide();
					});
				})
				//切换http|https验证代码 tab
				.on('click', '.tabs li', function(){
					var $this = $(this);
					$this
						.siblings()
						.removeClass('on')
						.end()
						.addClass('on');
					if($this.attr('value') === 'https'){
						$('#code_text').val('<script type="text/javascript" name="baidu-tc-cerfication" data-appid="' + GlobalInfo.app_id + '" src="https://apps.bdimg.com/cloudaapi/lightapp.js"></script>');
					} else {
						$('#code_text').val('<script type="text/javascript" name="baidu-tc-cerfication" data-appid="' + GlobalInfo.app_id + '" src="http://apps.bdimg.com/cloudaapi/lightapp.js"></script>');
					}
				});
		}
	};

	return popup;
});