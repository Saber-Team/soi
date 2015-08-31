/**
 * @fileOverview 交互逻辑处理
 */

define([
	'../../../../../../xcom/validator/formvalidator',
	'./qualification_uploader'
], function(FormValidator, quaUploader){
	'use strict';

	var $ = window.jQuery;

	/**
	 * 校验站点地址是否通过所有权验证
	 * @return {boolean} 校验结果
	 */
	function checkAppOwnership(){
		//站点地址的状态为通过验证或者用户输入的地址跟原始地址相同
		var originAppUrl = this.$el.data('originAppUrl'),
			originAppUrlStatus = this.$el.data('originAppUrlStatus'),
			status = false;
		status = this.$el.data('appUrlStatus') === 1 
				|| (originAppUrlStatus === 1 
					&& $.trim(this.$el.val()) === originAppUrl);
		return {
			result: status,
			msg: status?'':'站点没有通过所有权验证'
		};
	}

	/**
	 * 校验行业资质字段输入，用户需选中“不涉及以上行业”复选框或者上传相应资质
	 * @return {boolean} 校验结果
	 */
	function checkCredentials(){
		var status = $('#no_need_qualification_checkbox')[0].checked || !!quaUploader.uploader.getRes().length;
		return {
			result: status,
			msg: status?'':'未上传行业资质'
		};
	}

	/**
	 * 是否正在上传中
	 * @return {boolean} 校验结果
	 */
	function inUploading(){
		var status = quaUploader.uploader.getStatus();
		return {
			result: status,
			msg: status?'':'行业资质上传中请稍后'
		};
	}

	var formValidator = new FormValidator('submit_form', {
		checkpoints : ['blur'],
		rules : {
			checkAppOwnership: checkAppOwnership,
			checkCredentials: checkCredentials,
			inUploading : inUploading
		}
	});

	return formValidator;
	
});