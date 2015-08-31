/**
 * @fileOverview 对jquery ajax的封装，全局的错误处理机制
 * @author <a href="mailto:langyong@baidu.com">郎勇</a> 2015-08-18T15:58:55+08:00
 */

define([
	'../../../xcom/popup/errorpopup',
	'./msg'
], function(ErrorPopUp, ERROR_MSG){
	var $ = window.jQuery;

	$.zhida = $.zhida || {};

	/**
	 * 请求完成回调函数
	 */
	function onComplete(data, statusText, jqXhr){
		if(jqXhr.status >= 200 && (jqXhr.status < 300 || jqXhr.status === 304)){
			if(data.error_code){
				ErrorPopUp.show(ERROR_MSG.zhida[data.error_code] || ERROR_MSG.defaultMsg);
			}
		} else {
			ErrorPopUp.show(ERROR_MSG.defaultMsg);
		}
	}

	$.extend($.zhida, {
		ajax : function(){
			return $.ajax.apply($, arguments).always(onComplete);
		},
		get : function(){
			return $.get.apply($, arguments).always(onComplete);
		},
		post : function(){
			return $.post.apply($, arguments).always(onComplete);
		},
		getJSON : function(){
			return $.getJSON.apply($, arguments).always(onComplete);
		}
	});
});