/**
 * @fileOverview 全局的提示popup
 * @author <a href="mailto:langyong@baidu.com">郎勇</a> 2015-08-18T15:58:55+08:00
 * @version 1.0.0
 */

define(function(){
	var $ = window.jQuery,
		$popup = $('.o-error-popup'),
		ErrorPopup = {
			show: function(msg){
				$popup.find('.error-msg').text(msg);
				$popup.show();
			}
		};

	$popup
		.on('click', '.o-popup-close, .cancel-btn', function(){
			$popup.hide();
		});

	return ErrorPopup;
});