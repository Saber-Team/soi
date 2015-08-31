/**
 * @fileOverview 剪切版复制动作触发库
 * @author <a href="mailto:langyong@baidu.com">郎勇</a> 2015-07-30T21:26:30+08:00
 * @version 1.0.0
 * @example
 *
 * if you click the button below in the html, 
 * you will copy the text in the textarea into your system clipboard
 * 
 * in HTML file
 * <!DOCTYPE html>
 * <html>
 *     <body>
 *         <textarea id="copy_area">复制我复制我</textarea>
 *         <button id="copy_btn" data-clipboard-target="copy_area">点我复制</button>
 *     </body>
 * </html>
 *
 * in JavaScript file
 * clipboard.setCopyAction($('#copy_btn'));
 * 
 * Include Zeroclipboard (https://github.com/zeroclipboard/zeroclipboard)
 */

define(function() {
	'use strict';

	var clipboard = {},
		$ = window.jQuery,
		uid = 0,
		isFlashEnabled = !ZeroClipboard.isFlashUnusable(),
		copyClients = {},
		COPY_OKAY = '已经复制到系统剪切版',
		COPY_ERROR = '您的浏览器不支持复制，请选中内容后按Ctrl＋C自行复制';

	/**
	 * 通过flash设置复制行为按钮
	 * @function
	 * @param {!jQuery} $copyBtn buttom element to be added copy action to
	 */
	function setFlashCopyAction($copyBtn){
		ZeroClipboard.config({
			swfPath: '__SWF__/static/merchant/common/swf/ZeroClipboard.swf',
			//set timeout time to 3 seconds.
			flashLoadTimeout: 3000
		});
		var client = new ZeroClipboard($copyBtn);
		//在dom元素上绑定ZeroClipboard对象
		$copyBtn.data('clientId', uid);
		//建立ZeroClipboard跟uid的映射关系
		copyClients[uid++] = client;
		//监听复制事件
		client.on({
			'aftercopy': function(){
				alert(COPY_OKAY);
			},
			'error': function(e){
				if(e.name === 'clipboard-error'){
					alert(COPY_ERROR);
				} else {//如果flash发生了其他错误如加载失败，未安装，版本号过期等，就退化为使用html的方式进行复制操作
					isFlashEnabled = false;
					clipboard.cancelCopyAction($copyBtn);
					clipboard.setCopyAction($copyBtn);
					//permanantly destroy ZeroClipboard component.
					ZeroClipboard.destroy();
				}
			}
		});
	}

	/**
	 * 通过html方式设置复制行为。
	 * @function
	 * @param {!jQuery} $copyBtn buttom element to be added copy action to
	 */
	function setHtmlCopyAction($copyBtn){
		$copyBtn
			.on('click.copy', function(){
				var $codeText = $('#' + $copyBtn.data('clipboardTarget')),
					isSupport = false;
				//IE浏览器支持clipboard直接操作系统剪切版
				if(window.clipboardData){
					window.clipboardData.setData("Text", $codeText.val());
					isSupport = true;
				//其他标准浏览器使用范围API以及document.execCommand来进行复制操作
				} else if(document.implementation
						&& document.implementation.hasFeature
						&& document.implementation.hasFeature("Range", "2.0")
				){
					$codeText[0].select();
					try{
						if(document.queryCommandSupported('copy') && document.execCommand('copy')){
							isSupport = true;
							window.getSelection().removeAllRanges(); 				
						}
					} catch(ex){}
				}
				if(isSupport){
					alert(COPY_OKAY);
				} else {
					alert(COPY_ERROR);
				}
			});
	}
	
	/**
	 * 设置复制动作触发按钮
	 * 之所以需要用这种方式来进行复制操作，是因为js以及flash运行环境中
	 * 有安全机制保证复制操作需要在用户交互触发的回调函数中才能正常执行。
	 * @function
	 * @param {!jQuery} $copyBtn
	 * @throws {Error} If missing argument
	 */
	clipboard.setCopyAction = function($copyBtn){
		if(!$copyBtn instanceof jQuery || !$copyBtn.length){
			throw new Error('missing copy button');
		}
		//对于支持flash的情况下，优先使用flash进行剪切板操作
		if(isFlashEnabled){
			setFlashCopyAction($copyBtn);
		} else {//对于未安装flash插件的浏览器，通过JS进行分别处理。
			setHtmlCopyAction($copyBtn);
		}
	};

	/**
	 * 取消设置过的复制动作触发按钮
	 * @function
	 * @param  {!jQuery} $copyBtn
	 */
	clipboard.cancelCopyAction = function($copyBtn){
		var uid = $copyBtn.data('clientId'),
			client;

		//销毁ZeroClipboard实例
		if(typeof uid === 'number'){
			client = copyClients[uid];
			delete copyClients[uid];
			$copyBtn.removeData('clientId');
			client.destroy();
		} else {
			$copyBtn.off('click.copy');
		}
	};

	return clipboard;
});