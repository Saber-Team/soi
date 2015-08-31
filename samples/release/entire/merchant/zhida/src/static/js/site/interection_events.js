/**
 * @fileOverview 交互逻辑处理
 */

define([
	'./page_form_validator',
	'./qualification_uploader',
	'../../../../../../xcom/ImageViewer/ImageViewer',
	'../../../../../../xcom/popup/errorpopup',
	'../../../../../../xcom/tooltip/tooltip',
	'./verify_ownership_popup',
	'./disable_zhida_site_popup',
    '../../../../../common/js/api'
], function(formValidator, quaUploader, ImageViewer, ErrorPopup, Tooltip, verifyOwnersihpPopup, disableZhidaSitePopup, api){
	'use strict';

	var uploader;
	/**
	 * 使得表单进入编辑态，初始化校验组件，上传控件等
	 */
	function editFormHandler(){
		//使得form进入编辑模式
		formValidator.$el.addClass('edit');
		//取消编辑按钮和查看放大图片的事件监听
		$(document).off('.edit').off('.view-origin');
		//初始化输入框内容
		$('#app_url_input').val($('#app_url_text').html());
		//隐藏所有『修改』按钮
		$('#revise_immediately_btn, .tool-btn').hide();
		quaUploader.init();
		uploader = quaUploader.uploader;
	}


	function initInterectionEvents(){
		$(document)
			//点击修改、立即修改以及立即提交按钮，进入编辑模式
			.on('click.edit', '#revise_site_btn, #revise_immediately_btn, #recommit_site_btn', function(){
				if($(this).hasClass('btn-disabled'))return;
				editFormHandler();
			})
			//提交表单
			.on('click', '#submit_btn', function(){
				if(!$(this).hasClass('btn-disabled')){
					formValidator
						.validate()
						.done(function(){
							var $appUrl = $('#app_url_input'),
								uploaderRes,
								postData = {
									app_id : GlobalInfo.app_id,
									app_url : $.trim($appUrl.val()),
									create_type : $appUrl.data('createType'),
								},
								qualificationInfo;
							
							if(!$('#no_need_qualification_checkbox')[0].checked){
								qualificationInfo = [];
								uploaderRes = uploader.getRes();
								for(var p in uploaderRes){
									if(uploaderRes.hasOwnProperty(p)){
										qualificationInfo.push(uploaderRes[p].data.filehash);
									}
								}
								if(qualificationInfo.length){
									postData.ind_qua_info = JSON.stringify(qualificationInfo);
								}
							}
							$.zhida.post(api.zhida.submitZhidaSite, postData).done(function(data){
								if(!data.error_code){
									//设置店铺的remit_interval（结算周期）和balance_type（核销方式）
									//http://wiki.baidu.com/pages/viewpage.action?pageId=140040431
									$.ajax({
										url:'http://legobuilder.lightapp.orp.baidu.com/api/set_pay_method?openid=' + GlobalInfo.app_id,
										type: 'GET',
										timeout: 3000,
										dataType:'jsonp'
									}).always(function(){
										window.location.reload();
									});
								}
							});
						});
				}
			})
			//暂存表单
			.on('click', '#save_btn', function(){
				formValidator
					.validate()
					.done(function(){
						var $appUrl = $('#app_url_input'),
							uploaderRes,
							postData = {
								app_id : GlobalInfo.app_id,
								app_url : $.trim($appUrl.val()),
								create_type : $appUrl.data('createType'),
							},
							qualificationInfo;
						
						if(!$('#no_need_qualification_checkbox')[0].checked){
							qualificationInfo = [];
							uploaderRes = uploader.getRes();
							for(var p in uploaderRes){
								if(uploaderRes.hasOwnProperty(p)){
									qualificationInfo.push(uploaderRes[p].data.filehash);
								}
							}
							if(qualificationInfo.length){
								postData.ind_qua_info = JSON.stringify(qualificationInfo);
							}
						}
						$.zhida.post(api.zhida.saveZhidaSite, postData).done(function(){
							if(!data.error_code){
								window.location.reload();
							}
						});
					});
			})
			//取消站点设置修改
			.on('click', '#cancel_btn', function(){
				location.reload();
			})
			//点击更换站点地址
			.on('click', '#change_site_url', function(){
				var $appUrlInput = $('#app_url_input');
				if($appUrlInput.data('createType') === 1){
					$('#leading_to_builder_tip').show();
				}
				$appUrlInput.data('appUrlStatus', 0);
				$('#app_url_text').hide();
				$('#site_notice_4').hide();
				$appUrlInput.show();
				$('#verify_ownership_btn').show();
				$('#verify_read_link').show();
			})
			//不涉及特殊行业
			.on('change', '#no_need_qualification_checkbox', function(){
				if(this.checked){
					formValidator.$el
						.find('.o-webuploader')
						.hide()
						.siblings('.upload-notice')
						.hide();
					formValidator
						.items['uploader']
						.setValidateState(true);
				} else {
					formValidator.$el
						.find('.o-webuploader')
						.show()
						.siblings('.upload-notice')
						.show();
				}
			})
			//资质图片鼠标悬浮效果
			.on('mouseenter', '.o-thumbnail' , function (){
            	$(this)
            		.children('.o-remove')
            		.show()
                	.end()
                	.children('.o-hover')
                	.show();
        	})
        	.on('mouseleave', '.o-thumbnail', function (){
        		$(this)
        			.children('.o-remove')
        			.hide()
        			.end()
        			.children('.o-hover')
        			.hide();
        	})
        	//查看原图
        	.on('click.view-origin', '.view-origin', function(){
        		var picUrl = $(this).parent().parent().siblings('img').attr('src');
        		ImageViewer.open(picUrl);
        	})
        	//十分钟建站
        	.on('click', '#quick_build_site', function(e){
        		e.preventDefault();
        		window.location.href = this.href + encodeURIComponent(window.location.href);
        	});
	}

	return {
		init : function(){
			ImageViewer.init();
			initInterectionEvents();
			verifyOwnersihpPopup.init();
			disableZhidaSitePopup.init();
			//如果已经有edit这个class，就初始化表单模块
			if($('#submit_form').hasClass('edit')){
				editFormHandler();
			}
			//如果不涉及以上行业默认为选中态，则调整页面显式状态
			if($('#no_need_qualification_checkbox')[0].checked){
				$('#no_need_qualification_checkbox').trigger('change');
			}

			//为禁用按钮添加tooltip
			if($('#revise_site_btn').hasClass('btn-disabled')){
				new Tooltip({
	                ele: '#revise_site_btn',
	                content: GlobalInfo.qua_status === 7?'直达号复审成功才能修改直达站点哦':GlobalInfo.qua_status >= 8?'直达号已下线，无法操作':'审核中无法修改',
	                eventName: 'hover',
	                pos: 'b',
	                height: 40,
	                width: GlobalInfo.qua_status === 7?200:GlobalInfo.qua_status >= 8?132:90,
	                theme: 'default'
	            });
			}
			if($('#revise_immediately_btn').hasClass('btn-disabled')){
				new Tooltip({
	                ele: '#revise_immediately_btn',
	                content: GlobalInfo.qua_status === 7?'直达号复审成功才能修改直达站点哦':GlobalInfo.qua_status >= 8?'直达号已下线，无法操作':'审核中无法修改',
	                eventName: 'hover',
	                pos: 'b',
	                height: 40,
	                width: GlobalInfo.qua_status === 7?200:GlobalInfo.qua_status >= 8?132:90,
	                theme: 'default'
	            });
			}
			if($('#recommit_site_btn').hasClass('btn-disabled')){
				new Tooltip({
	                ele: '#recommit_site_btn',
	                content: GlobalInfo.qua_status >= 8?'直达号已下线，无法操作':'审核中无法修改',
	                eventName: 'hover',
	                pos: 'b',
	                height: 40,
	                width: GlobalInfo.qua_status >= 8?132:90,
	                theme: 'default'
	            });
			}
			if($('#disable_site_btn').hasClass('btn-disabled')){
				new Tooltip({
	                ele: '#disable_site_btn',
	                content: '审核中无法修改',
	                eventName: 'hover',
	                pos: 'b',
	                height: 40,
	                width: 90,
	                theme: 'default'
	            });
			}
		}
	}
});