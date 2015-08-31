/**
 * @fileoverview 简单封装webuploader,使用之前保证已经加载了webuploader.js
 * @email xiongchengbin@baidu.com
 *
 * dom结构:
 *  缩略图的显示结构:
 *  <div class="o-thumbnail o-upload-done" data-order="2">
 <img src="">
 <div class="o-remove" style="display: none;"></div>
 <div class="o-hover" style="">
 <span><div class="view-origin"></div></span><span><div class="re-upload"></div></span>
 </div>
 </div>
 *
 新增按钮的显示结构:
 <div id="filePicker" class="o-filepicker">
 <div class="up-icon"></div>
 <div class="up-text">上传文件</div>
 </div>
 *
 * 使用方式:
 *  1.new一个Uploader实例:
 *      var upload = new Uploader({
                server: 'xxxx',
                fileVal: 'ufile',
                pick: {
                    id: '#filePicker',
                    multiple: true
                },
                fileNumExist: 3,
                fileNumLimit: 5
            }),
 * 2.初始化该实例:
 *      upload.init();
 *
 * 3.为现有的图片绑定重新上传事件:
 *      upload.initExist($('.o-thumbnail'), data);
 *
 * 4.获取上传图片的信息:
 *     upload.getRes()====> Array
 */


define(['../imageviewer/imageviewer', '../eventemitter/eventemitter'], function (imageViewer, EventEmitter) {
    'use strict';
    var $ = jQuery;

    /**
     *
     * @param {object} conf: 配置文件,参数参考 http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_options
     *         其中formData中的字段,见wiki: http://wiki.baidu.com/pages/viewpage.action?pageId=128483186
     *         额外的参数:
     *              fileNumExist {int} : 已经有的图片数量
     *              sizeCheck {boolean}: 判断是否需要进行尺寸校验,目前只支持单文件的尺寸校验
     *              width {int}: 上传图片的长度限制
     *              height {int}: 上传图片的高度限制
     * @constructor Uploader
     *
     */
    function Uploader(conf) {
        var ratio = window.devicePixelRatio || 1, //Mac的retain屏幕
            defaultConf = {
                swf: '/static/merchant/common/swf/uploader.swf',
                auto: true,
                resize: false,
                //runtimeOrder: 'flash,html5',
                fileVal: 'ufile',
                fileNumLimit: 5,
                fileSizeLimit: 10 * 1024 * 1024,
                accept: {
                    title: 'Images',
                    extensions: 'jpg,jpeg,png',
                    mimeTypes: 'image/*'
                },
                thumb: {
                    width: 120 * ratio,
                    height: 90 * ratio,
                    type: 'image/jpeg'
                },
                duplicate: true,
                fileNumExist: 0,
                errImgPath: './uploader-error.png',
                formData: {
                    bdstoken: '',
                    from_hash: 1,
                    upload_type: 'light_app_icon'
                }
            };

        this.conf = $.extend(true, {}, defaultConf, conf);
        //图片上传数量的计数器,初始化为已经存在的图片数量, e.g. 图片查看状态到编辑状态时,需要记住目前是多少张图片
        this.fileNumCount = conf.fileNumExist || 0;
        //记录绑定webuploader的按钮
        this.ele = $(conf.pick && conf.pick.id || conf.pick);
        // 记录图片上传之后，服务器的返回值，
        this.response = {};
        //已经存在的数据，需要和dom关联
        this.existData = {};
        //暂时保存需要删除的数据，以便恢复使用，例如上传时，取消，此时需要恢复上传之前的数据
        this.tempRemove = {};
        //记录查看状态到编辑态  重新上传时需要被替换的缩略图
        this.$replaceTarget = '';

        //重新上传按钮的WebUploader实例, 对应多个重新上传的按钮
        this.singleUploader = '';
        //上传文件的WebUploader实例,支持多选
        this.uploader = '';

        //上传状态,所有都上传完之后为true
        this.status = true;
    }

    $.extend(Uploader.prototype, {
        init: function () {
            this.uploader = WebUploader.create(this.conf);
            this.bindUploadEvents();
            //fix 查看态变为编辑态 总数达到限额,则不显示新增图片上传按钮
            this.uploader.trigger('toggleUploaderBtn');
        },

        initReUploader: function () {
            /**
             * @type {Uploader}
             * 初始化一个重新上传的WebUploader实例,用于图片的重新上传.
             *
             * 如果已经存在,则重置该实例
             */
            var that = this;
            if (that.singleUploader) {
                that.singleUploader.reset();
            }
            else {
                that.singleUploader = WebUploader.create($.extend(true, {}, this.conf, {pick: '', fileNumLimit: 1}));
                that.bindReUploadEvents();
            }
        },

        initExist: function ($target, data) {
            /**
             * @type {Uploader}
             *
             * @param $target {Selector}: 已经存在的缩略图的选择器,
             *        data {Object}: 已经存在的图片对应的数据, 需要和dom一一对应, dom上使用  data-order='x'来表示顺序,
             *                       data中则 {x: '......'}来表示对应的数据
             * 初始化已经存在的缩略图,主要针对的场景是,又查看状态变为编辑状态,需要提供重新上传和删除事件.
             */
            var that = this,
                $target = $target.closest('.o-webuploader') || $(document.body);

            //绑定删除事件
            $target.find('.o-remove').off().on('click', function () {
                $(this).closest('.o-thumbnail').remove();
                that.fileNumCount ? that.fileNumCount-- : that.fileNumCount = 0;
                //删除图片时,同时也删除对应的数据
                delete that.existData[$(this).closest('.o-thumbnail').data('order')];
                // 删除图片时,显示新增上传的按钮
                that.showUploader();
                // 通知外部组件
                that.trigger('remove', that);
            });

            //绑定重新上传的事件
            $target.find('.o-hover .re-upload').each(function (inx, ele) {
                that.addReUploadButton(ele);
            });

            $target.find('.o-thumbnail')
                .removeClass('o-thumbnail-view')
                .addClass('o-upload-done')
                .off()
                .on('mouseenter', function (e) {
                    var $that = $(this);
                    $that.children('.o-remove').show()
                        .end().children('.o-hover').show();
                    if (that.isFlash() && that.isIE(9)) {
                        $that.children('.o-hover').css({
                            'left': 'auto'
                        });
                    }
                })
                .on('mouseleave', function (e) {
                    var $that = $(this);
                    $that.children('.o-remove').hide();
                    if (that.isFlash() && that.isIE(9)) {
                        $that.children('.o-hover').css({
                            'left': '2000px'
                        });
                    }
                    else {
                        $that.children('.o-hover').hide();
                    }
                });

            //查看大图
            $target.find('.o-hover .view-origin').off().on('click', function (e) {
                var $img = $(this).closest('.o-thumbnail').children('img');
                imageViewer.init();
                imageViewer.open($img.attr('src'));
            });

            //获取图片对应的信息
            that.existData = data;
        },

        render: function ($item, isNew) {
            /**
             * @param $item {Selector}: 需要添加元素的dom选择器
             *         isNew {boolean}: 是否是完成新增,还是部分,主要针对的场景是, 图片由查看状态变为编辑状态
             * @type {string}
             */
            var that = this,
                tpl = '';
            if (isNew) {
                tpl = [
                    '<div class="o-mask"></div>',
                    '<div class="o-progress-text">等待上传</div>',
                    '<div class="o-progress-bar">',
                    '<p></p>',
                    '</div>',
                    '<div class="o-remove"></div>',
                    '<div class="o-hover o-hover-disabled">',
                    '<span><div class="view-origin"></div></span>',
                    '<span><div class="re-upload"></div></span>',
                    '</div>'
                ].join('');

                $item.append(tpl);

                $item.insertBefore($(this.ele));
            }
            else {
                //可能从查看态变为编辑态，初始化
                if (!$item.children('.o-mask').length) {
                    tpl += '<div class="o-mask"></div>';
                }

                if (!$item.children('.o-progress-bar').length) {
                    tpl += '<div class="o-progress-text">等待上传</div>' +
                        '<div class="o-progress-bar"><p></p><div>';
                }

                if (!$item.children('.o-hover').length) {
                    tpl += '<div class="o-hover o-hover-disabled">' +
                        '<span><div class="view-origin"></div></span>' +
                        '<span><div class="re-upload"></div></span>' +
                        '</div>';
                }
                $item.append(tpl);
                //初始化显示效果, 进度条,蒙层等
                $item.removeClass('o-upload-error o-upload-done').children('.o-mask').show()
                    .end().children('.o-hover').addClass('o-hover-disabled')
                    .end().children('.o-progress-text').removeClass('o-progress-icon').text('等待上传').show()
                    .end().children('.o-progress-bar').show().children('p').css('width', 0);
            }
        },

        addReUploadButton: function (id, innerHTML) {
            /**
             * @param id {Selector}: 绑定重新上传按钮,
             * 具体见: http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_addButton
             * @type {Uploader}
             */
            var that = this;
            if (!that.singleUploader) {
                that.initReUploader();
            }

            that.singleUploader.addButton({
                id: id,
                innerHTML: innerHTML || '',
                multiple: false
            });
        },

        makeThumbnail: function (file, $item, isNew) {
            /**
             * @param file {FILE}: 上传的图片对象
             *        $item {Selector}: 包含缩略图的容器
             *        isNew {boolean}: 新增缩略图或者覆盖原有的
             * @type {Uploader}
             *
             */
            var that = this,
                $img = $item.children('img');
            //调用WebUploader的makeThumb函数,  逻辑判断都在回调函数中进行
            that.uploader.makeThumb(file, function (err, src) {
                if (err) {
                    $img.replaceWith('<span>不能预览<span>');
                    return;
                }

                that.replaceExistThumb(file);

                $img.attr('src', src);


                that.bindThumbEvents($item, file);

                //makeThumb是一个异步函数, 判断是否需要隐藏新增图片的按钮
                that.uploader.trigger('toggleUploaderBtn');
            });
        },

        bindThumbEvents: function ($item, file) {
            /**
             * @param $item {Selector}: 缩略图的DOM选择器
             *          file {FILE} : dom 对应的 file对象
             * @type {Uploader}
             *
             * 为上传过程中生成的缩略图绑定事件,  包含 hover, 删除, 重新上传, 查看大图等事件
             */
            var that = this;
            //hover事件
            $item.off().on('mouseenter', function (e) {
                var $that = $(this);
                // 防止在上传过程hover
                if ($that.children('.o-hover-disabled').length) return;

                $that.children('.o-remove').show()
                    .end()
                    .children('.o-hover').show();
                if (that.isFlash() && that.isIE(9)) {
                    $that.children('.o-hover').css({
                        'left': 'auto'
                    });
                }
            }).on('mouseleave', function (e) {
                var $that = $(this);
                $that.children('.o-remove').hide();
                if (that.isFlash() && that.isIE(9)) {
                    $that.children('.o-hover').css({
                        'left': '2000px'
                    });
                }
                else {
                    $that.children('.o-hover').hide();
                }
            });

            //删除事件
            $item.children('.o-remove').off().on('click', function (e) {
                that.removeQueueFile(file);
                $item.remove();
                that.showUploader();
            });
            //重新上传事件
            if (that.isFlash()) {
                $item.find('.re-upload').off().on('mouseup', function (e) {
                    console.log('re-upload');
                    that.tempRemove.file = file;
                    that.tempRemove.res = that.response[file.id];
                });
            }
            else {
                $item.find('.re-upload').off().on('click', function (e) {
                    //console.log('re-upload click');
                    that.tempRemove.file = file;
                    that.tempRemove.res = that.response[file.id];
                });
            }


            //查看大图
            $item.find('.view-origin').off().on('click', function (e) {
                imageViewer.init();
                imageViewer.open(that.response[file.id].data.filehash);
            });
        },

        bindUploadEvents: function () {
            /**
             * @type {Uploader}
             *
             * 绑定上传的一些事件, 包含在文件加入上传队列的 beforeFileQueued事件,
             *      文件加入队列的  fileQueued事件
             *      上传进度 uploadProgress事件
             *      文件上传完成 uploadSuccess事件
             */
            var that = this;

            //文件加入队列前,判断文件总是是否超过限制,超过则不加入队列
            that.uploader.on('beforeFileQueued', function (file) {
                var $refer = file.source._refer;

                if (file.size > that.conf.fileSizeLimit) {
                    that.uploader.trigger('error','Q_EXCEED_SIZE_LIMIT');
                    return false;
                }

                if ($refer.closest('.o-thumbnail').length) {
                    that.$replaceTarget = $refer.closest('.o-thumbnail');
                }
                else {
                    that.$replaceTarget = '';
                }

                // 验证文件总数量，如果超过则不加入队列，并提示对应错误
                if (that.fileNumCount >= that.conf.fileNumLimit) {
                    that.uploader.trigger('error', 'Q_EXCEED_NUM_LIMIT');
                    return false;
                }
            });

            //文件加入队列,生成缩略图,
            that.uploader.on('fileQueued', function (file) {
                var $item, isNew;
                that.fileNumCount++;

                //是否是重新上传，重新上传则替换已经存在的缩略图，否则新生成缩略图
                if (that.$replaceTarget) {
                    $item = that.$replaceTarget;
                    that.makeThumbnail(file, $item);
                }
                else {
                    $item = $('<div id="' + file.id + '" class="o-thumbnail"> <img> </div>');
                    that.makeThumbnail(file, $item, true);
                    isNew = true;
                }

                that.render($item, isNew);

                that.status = false;
            });

            that.uploader.on('filesQueued', function (files) {
                //TODO
            });

            that.uploader.on('fileDequeued', function (file) {
                //TODO
            });

            //上传进行中,显示相关的进度
            that.uploader.on('uploadProgress', function (file, percentage) {
                var $item = $('#' + file.id),
                    $text = $item.children('.o-progress-text'),
                    $bar = $item.find('.o-progress-bar p');

                $text.text(percentage * 100 + '%');
                $bar.css('width', percentage * 100 + '%');
            });

            //文件上传成功,显示相关的样式,并将服务器返回给的数据保存到 response中,
            that.uploader.on('uploadSuccess', function (file, response) {
                var $item = $('#' + file.id),
                    $reUpload = $item.find('.re-upload');

                if (response.data && response.data.filehash) {

                    $item.addClass('o-upload-done').children('.o-progress-text').addClass('o-progress-icon').text('')
                        .end().children('.o-progress-bar').hide();

                    setTimeout(function () {
                        $item.children('.o-mask').hide()
                            .end().children('.o-progress-text').hide()
                            .end().children('.o-hover').removeClass('o-hover-disabled');
                    }, 1000);

                    if (!$reUpload.hasClass('webuploader-container')) { //有可能重新上传，
                        that.addReUploadButton($reUpload);
                    }

                    //保存数据
                    that.response[file.id] = response;
                }
                else {
                    that.uploader.trigger('uploadError', file, response.data);
                }
            });

            that.uploader.on('uploadError', function (file, reason) {
                var $item = $('#' + file.id),
                    $reUpload = $item.find('.re-upload');
                that.showError('文件上传错误: ' + reason);
                $item.addClass('o-upload-error')
                    .children('img').attr('src', that.conf.errImgPath)
                    .next('.o-mask').hide()
                    .next('.o-progress-text').hide()
                    .next('.o-progress-bar').hide()
                    .nextAll('.o-hover').removeClass('o-hover-disabled');

                if (!$reUpload.hasClass('webuploader-container')) { //有可能重新上传，
                    that.addReUploadButton($reUpload);
                }
            });

            //文件上传相关的错误,
            that.uploader.on('error', function (type) {
                switch (type) {
                    case 'Q_EXCEED_NUM_LIMIT':
                    {
                        that.showError('选择的图片过多，超出部分自动忽略');
                        break;
                    }

                    case 'Q_EXCEED_SIZE_LIMIT':
                    {
                        that.showError('选择的图片尺寸过大，自动忽略');
                        break;
                    }

                    case 'Q_TYPE_DENIED':
                    {
                        that.showError('选择的文件格式不符合要求，请确认后选择');
                        break;
                    }

                    case 'Q_FILE_SIZE_WRONG':
                    {
                        that.showError('图片尺寸不符合要求，请重新选择');
                        break;
                    }
                }
            });

            //所有图片都上传完成
            that.uploader.on('uploadFinished', function () {
                that.tempRemove = {}; //上传之后将其初始化为空
                that.status = true;
            });

            //隐藏或者显示新增按钮
            that.uploader.on('toggleUploaderBtn', function () {
                that.fileNumCount >= that.conf.fileNumLimit ? that.hideUploader() : that.showUploader();
            });
        },

        removeQueueFile: function (file, removeFromQueue) {
            /**
             * @param file {FILE}: 需要移除的文件对象
             *         removeFromQueue {boolean}: 是否出队列中移除,如果为false, 则只是标记文件状态,而不移除
             * 移除队列中的文件
             */
            this.fileNumCount--;
            this.response[file.id] && delete this.response[file.id];
            removeFromQueue ? this.uploader.removeFile(file, true) : this.uploader.removeFile(file);
        },

        bindReUploadEvents: function () {
            /**
             * @type {Uploader}
             *
             * 绑定重新上传的WebUploader实例的事件,主要是在加入队列前将文件加入到uploader中,
             */
            var that = this;

            that.singleUploader.on('beforeFileQueued', function (file) {
                if (file.size > that.conf.fileSizeLimit) {
                    that.uploader.trigger('error','Q_EXCEED_SIZE_LIMIT');
                    return false;
                }
                if (that.tempRemove.file) {
                    that.removeQueueFile(that.tempRemove.file, true);
                }
                else {
                    that.fileNumCount > 0 ? that.fileNumCount-- : that.fileNumCount = 0;
                }

                that.uploader.addFiles(file);
                return false;
            });
        },

        showError: function (text) {
            /**
             *@param text {String}: 错误信息
             *
             * 显示一些错误信息
             */
            var $err = $('.o-error');

            if (!$err.length) {
                $err = $('<div class="o-error"></div>').appendTo('.o-webuploader');
            }

            $err.text(text);

            //根据文本的宽度居中显示
            $err.css('margin-left', -$err.width() / 2).show();

            setTimeout(function () {
                $err.hide();
            }, 2 * 1000)
        },

        showUploader: function () {
            var that = this;
            if (that.isFlash() && that.isIE(9)) {
                this.ele.css({
                    'position': 'relative',
                    'left': 'auto'
                }).show();
            }
            else {
                this.ele.show();
            }
        },

        hideUploader: function () {
            var that = this;
            if (that.isFlash() && that.isIE(9)) {
                this.ele.css({
                    'position': 'absolute',
                    'left': '2000px'
                }).show();
            }
            else {
                this.ele.hide();
            }
        },

        isIE: function (version) {
            return navigator.appName == "Microsoft Internet Explorer" &&
                navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == ("MSIE" + version + ".0");
        },

        isFlash: function () {
            var result = '';
            return (function () {
                if (result !== '') {
                    return result;
                }
                return (result = $('.o-webuploader').find('object').length);
            })();
        },

        replaceExistThumb: function (file) {
            var that = this;
            //替换已经存在的缩略图
            if (that.$replaceTarget) {
                var $item = that.$replaceTarget;

                $item.attr('id', file.id);

                if ($item.data('order') >= 0) {
                    delete that.existData[$item.data('order')];
                    $item.data('order', -1);
                }
                that.$replaceTarget = '';
            }
        },

        getRes: function () {
            /**
             *将上传图片的相关信息以数组形式返回给使用者.
             */
            var that = this,
                res = [];

            $.each(that.response, function (idx, ele) {
                res.push(ele);
            });

            //获取现有的数据
            $.each(that.existData, function (idx, ele) {
                res.push(ele);
            });
            return res;
        },

        getStatus: function () {
            return this.status;
        }
    });

    //window.Uploader = Uploader;
    EventEmitter.bind(Uploader);
    return Uploader;
});