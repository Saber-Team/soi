/**
 * @fileoverview 简单封装的logo上传组件,依赖第三方插件 FileAPI, FileAPI的jquery插件jquery.fileapi, jCrop
 * @email xiongchengbin@baidu.com
 *
 * 使用说明:
 *  1.new一个LogoUpload实例:
       var logoupload = new LogoUpload({
               url: '/upload', //logo上传的服务器地址
               data: {}, //上传logo附加的参数,例如bdstoken等
               pick: 'body' //需要初始化logo上传对应的dom元素选择器
           });
           //其他一些参数配置详细请参考 https://github.com/RubaXa/jquery.fileapi/

   2. 初始化该实例
        logoupload.init(url); //url为已经上传过logo的地址,如果还没有上传过logo,则可以不传该参数

   3. 上传logo完成时,获取服务返回的数据
        logoupload.getResponse();
        //其格式为:
             {
                 "filehash": {
                     "logo512":"http:\/\/apps1.bdimg.com\/store\/static\/kvt\/97ed0521a214ef8702f826d8591d2313.jpg",
                     "logo90":"http:\/\/apps2.bdimg.com\/store\/static\/kvt\/fb35f5e27e6d661cd15ff3d1a74bf727.jpg",
                 },
                 "filename": "IMG_0211.JPG"
            },
 */

define(['../eventemitter/eventemitter'], function (EventEmitter) {
    'use strict';
    var $ = jQuery;


    /**
     * LOGO裁切弹窗的类包装
     * @constructor LOGO裁切弹窗的构造函数
     */
    function Popup () {
        this.tpl = [
            '<div class="popup">',
                '<div class="popup-container">',
                    '<div class="popup-title">裁切图片 <span class="popup-close cancel">X</span></div>',
                    '<div class="popup-body">',
                        '<div class="popup-img"></div>',
                    '</div>',
                    '<div class="popup-footer">',
                        '<button class="btn-blue btn-38 btn-upload">确认</button>',
                        '<button class="btn-gray btn-38 btn-cancel cancel">取消</button>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');

        this.$popup = '';
    }

    $.extend(Popup.prototype, {
        init: function () {
            this.render();
        },
        render: function () {
            if (!this.$popup) {
                this.$popup = $(this.tpl).appendTo(document.body);
                this.bindEvents();
            }
            return this;
        },
        show: function () {
            this.$popup.show();
            return this;
        },
        hide: function () {
            this.$popup.hide();
            return this;
        },
        bindEvents: function () {
            var that = this,
                $cancel = that.$popup.find('.cancel');

            $cancel.on('click', function (e) {
                that.hide();
            });
            return this;
        },
        destroy: function () {
            this.getUploadBtn().off();
            this.$popup.remove();
        },
        getImgDom: function () {
            return this.$popup.find('.popup-img');
        },
        getUploadBtn: function () {
            return this.$popup.find('.btn-upload');
        },
        setTitle: function (title) {
            this.$popup.find('.popup-title').html(title);
            return this;
        }
    });


    /**
     * LOGO上传组件类包装
     * @param {Object} conf: LOGO上传的一些配置,包含但不限于上传接口地址, 图片大小, 支持的扩展名, 上传失败时需要显示的占位符图片等
                             详细配置请参考: https://github.com/RubaXa/jquery.fileapi/
     * @constructor LOGO上传组件的构造函数
     */
    function LogoUpload (conf) {
        //默认的一些参数配置
        var opts = {
            url: '/v3/upload',
            imageSize: {minWidth: 200, minHeight: 200},
            accept: 'image/*',
            paramName: 'ufile',
            maxSize: FileAPI.MB*10, // max file size
            elements: {
                preview: {
                    el: '.logo-preview',
                    width: 90,
                    height: 90
                }
            },
            //以下四个为外加的参数, 在jquery.fileapi中没有
            pick: '', //需要绑定logo上传组件的dom元素的选择器
            extensions: 'jpg,jpeg,png,gif',//文件扩展名称
            errImgPath: './logo-error.png', //上传失败时,需要显示的占位符图片
            text: '上传LOGO' //文字提示,默认为  上传LOGO
        };

        //初始化logo上传的模板
        this.tpl = [
            '<div class="o-logo">',
                '<div class="logo-pick">',
                    '<div class="logo-browse  js-fileapi-wrapper">',
                        '<div class="up-icon"></div>',
                        '<div class="up-text">' + (conf.text || '上传LOGO') +'</div>',
                        '<input type="file" name="files" accept="image/*">',
                    '</div>',
                    '<div class="logo-uploading">',
                        '<div class="logo-overlay"></div>',
                        '<div class="progress-text">等待上传</div>',
                        '<div class="progress-bar">',
                            '<p class="bar"></p>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class=""></div>',
                '<div class="logo-preview"></div>',
            '</div>'
        ].join('');

        //模板对应的dom对象,
        this.$logo = '';

        //参数配置
        this.opts = $.extend(true, opts, conf);

        //上传logo之后，服务器返回的消息
        this.data = '';

        //表示文件是否上传完成
        this.flag = false;
    }

    $.extend(LogoUpload.prototype, {
        init: function (url) {
            /**
             * LogoUpload初始化, 实例化一个裁切弹窗Popup的实例,同时渲染上传组件模板
             * @type {LogoUpload}
             */
            var that = this;
            this.popup = new Popup();
            this.defualtLogo = url;
            this.render();
            this.bindEvents();
            this.$logo.fileapi($.extend(true, {}, this.opts, {
                onSelect: function (evt, ui) {that.onSelect(evt, ui);},
                onBeforeUpload: function (evt, uploadInfo) {that.onBeforeUpload(evt, uploadInfo);},
                onUpload: function (evt, uploadInfo) {that.onUpload(evt, uploadInfo);},
                onProgress: function (evt, uploadInfo) {that.onProgress(evt, uploadInfo); },
                onFileComplete: function (evt, uploadInfo) {that.onFileComplete(evt, uploadInfo); },
                filterFn: function (file, info) {return that.filterFn(file, info);}
            }));

            this.renderInitLogo();
        },
        render: function () {
            this.$logo = $(this.tpl);
            if (this.defualtLogo) {
                //如果已有logo图片,隐藏上传的图标和文字,防止页面闪动
                this.$logo.find('.up-icon').hide().next('.up-text').hide();
            }
            this.$logo.appendTo(this.opts.pick || document.body);
            return this;
        },
        renderInitLogo: function () {
            var that = this;
            if (that.defualtLogo) {
                that.$logo.children('.logo-preview')
                    .append('<img alt="LOGO缩略图" src="' + that.defualtLogo + '">')
                    .show()
                    .data('render', true);
                that.flag = true;
            }
        },
        bindEvents: function () {
            var that = this,
                $preview = that.$logo.children('.logo-preview'),
                $browse = that.$logo.find('.logo-browse');

            $browse.on('mouseenter', function () {
                $(this).addClass('logo-browse-hover');
            }).on('mouseleave', function () {
                $(this).removeClass('logo-browse-hover');
            });


            that.$logo.on('mouseenter', function (e) {
                if ($preview.data('render') && that.flag) {
                    $preview.addClass('logo-preview-hover');
                }
            }).on('mouseleave', function () {
                $preview.removeClass('logo-preview-hover');
            });

            //针对IE9做的特殊化处理,因为IE9无法使用h5上传而使用flash上传,
            if (that.isIE(9)) {
                $('div[id^="_fileapi"]').on('mouseenter', function (e) {
                    if ($preview.data('render') && that.flag) {
                        $preview.addClass('logo-preview-hover');
                    }
                    $browse.addClass('logo-browse-hover');
                }).on('mouseleave', function () {
                    $preview.removeClass('logo-preview-hover');
                    $browse.removeClass('logo-browse-hover');
                });
            }
        },
        filterFn: function (file, info) {
            /**
             * 过滤不满足要求的图片,
             * @type {LogoUpload}
             */
            var that = this,
                reg = /\.([0-9a-z]+)(?:[\?#]|$)/i,
                extension = file.name.match(reg)[1];
            if (that.opts.extensions.indexOf(extension) == -1) {
                that.showError('选择的图片格式不正确，请确认后重试');
                return false;
            }
            return true;
        },
        //以下以 "on"开头的是文件上传的一些回调函数.
        onSelect: function (evt, ui) {
            var that = this,
                file = ui.files[0];

            //一些错误判断,与浏览器是否支持flash判断
            if (ui.other[0] &&ui.other[0].errors) {
                that.showError('选择的图片尺寸不符合要求，请确认后重试');
                return;
            }

            if ( !FileAPI.support.transform ) {
                that.showError('浏览器不支持Flash，请确认后重试');
            }
            else if ( file ) {
                //没有错误时,弹出裁切浮层,对图片进行裁切
                that.popup.init();
                that.popup
                    .show()
                    .getImgDom().cropper({
                        file: file,
                        keySupport: false,
                        bgColor: '#FFFFFF',
                        maxSize: [500, 400],
                        minSize: [200, 200],
                        selection: '90%',
                        onSelect: function (coords) {
                            that.$logo.fileapi('crop', file, coords);
                        }
                    });

                that.popup.getUploadBtn()
                    .off()
                    .on('click', function () {
                        that.popup.hide();
                        that.$logo.fileapi('upload');
                    });


                //展示缩略图
                that.$logo.children('.logo-preview').show().data('render', true);
                //调用用户自定义的onSelect函数
                that.opts.onSelect && that.opts.onSelect(evt, files);
            }
        },
        onBeforeUpload: function (evt, uploadInfo) {
            this.$logo
                .find('.logo-browse').hide()
                .end()
                .find('.logo-uploading').show().find('.progress-text').removeClass('progress-finish')
                .end()
                .find('.progress-bar').show();
            this.opts.onBeforeUpload && this.opts.onBeforeUpload(evt, uploadInfo);
        },
        onUpload: function (ext, uploadInfo) {
            this.flag = false;
        },
        onProgress: function (evt, uploadInfo) {
            var per = uploadInfo.loaded / uploadInfo.total * 100 >> 0;
            this.$logo
                .find('.bar').css('width', per + '%')
                .end()
                .find('.progress-text').text(per + '%');
            this.opts.onProgress && this.opts.onProgress(evt, uploadInfo);
        },
        onFileComplete: function (evt, uploadInfo) {
            var that = this;
            if (!uploadInfo.error &&
                uploadInfo.result &&
                uploadInfo.result.data &&
                uploadInfo.result.data.filehash) {

                that.data = uploadInfo.result.data;
                that.$logo
                    .find('.progress-text').addClass('progress-finish').text('')
                    .end()
                    .find('.progress-bar').hide();
                setTimeout(function () {
                    that.$logo
                        .find('.logo-uploading').hide()
                        .end()
                        .find('.logo-browse').show();

                    that.flag = true;
                }, 1000);
            }
            else if (uploadInfo.result && uploadInfo.result.data) {
                //服务器返回错误码
                that.showError(uploadInfo.result.data.errorinfo);
                that.uploadError();

            }
            else if (uploadInfo.status != 200) {
                //一些网络错误处理的简单处理
                that.showError(uploadInfo.statusText);
                that.uploadError();
            }
            else {
                that.showError('上传失败，请稍后重试');
                that.uploadError();
            }

            that.opts.onFileComplete && that.opts.onFileComplete(evt, uploadInfo);
        },
        //文件上传回调函数结束
        destroy: function () {
            this.popup.destroy();
            //TODO
        },
        uploadError: function () {
            /**
             * 上传失败时,替换缩略图为上传失败的提示图标
             */
            this.$logo
                .find('.logo-uploading').hide()
                .end()
                .find('.logo-browse').show()
                .end()
                .children('.logo-preview')
                .html('<img alt="LOGO缩略图" src="'+ this.opts.errImgPath +'">');
            this.flag = true;
        },
        isIE: function (version) {
            return navigator.appName == "Microsoft Internet Explorer" &&
                navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == ("MSIE" + version + ".0");
        },
        showError: function (text) {
            var $err = $('.o-error', '.o-logo');

            if (!$err.length) {
                $err = $('<div class="o-error"></div>').appendTo('.o-logo');
            }

            $err.text(text).show();

            setTimeout(function () {
                $err.hide();
            }, 2 * 1000)
        },
        getResponse: function () {
            return this.data;
        },
        log: function (txt) {
            //开发测试使用
            console.log(txt);
        }
    });

    EventEmitter.bind(LogoUpload);
    return LogoUpload;
});
