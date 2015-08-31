/**
 * @fileOverview 上传组件
 */
define([
	'../../../../../../xcom/uploader/uploader'
], function(Uploader, formValidator){

	/*function onuploadfinished(){
		formValidator.items['uploader'].setValidateState(true);
	}*/

	var uploader = {
		init: function(){
			//初始化上传控件
			var $webuploaderWrapper = $('.o-webuploader').eq(0),
				$filepicker = $webuploaderWrapper.find('.o-filepicker'),
				$thumbnails = $webuploaderWrapper.find('.o-thumbnail'),
				uploaderInstance,
				imgData = {};

			$thumbnails.each(function(i, el){
				var url = $(el).children('img').attr('src'),
					filename = url.split('/');
				filename = filename[filename.length - 1];
				imgData[i] = {
					data : {
						filehash:url,
						filename:filename
					}
				};
			});
			uploaderInstance = new Uploader({
				server: '__UPLOAD__',
				fileVal: 'ufile',
				pick: {
					id: $filepicker.show(),
					multiple: true
				},
				formData: {
		            bdstoken: GlobalInfo.bdstoken,
		            from_hash: 1,
		            upload_type: 'identity_photo'
		        },
		        fileSizeLimit: 10 * 1024 * 1024,
				fileNumExist: $thumbnails.length,
				fileNumLimit: 20
			});
			uploaderInstance.init();
			if(imgData[0]){
				uploaderInstance.initExist($webuploaderWrapper, imgData);
			}
			//上传完毕后取消错误提示
			//uploaderInstance.uploader.on('uploadFinished', onuploadfinished);
			this.uploader = uploaderInstance;
		}
	}

	return uploader;
});