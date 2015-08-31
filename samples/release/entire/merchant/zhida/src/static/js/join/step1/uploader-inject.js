/**
 * @fileoverview 对uploader实例扩展一些约定的方法
 * @email zhangshen04@baidu.com
 */

define([
    '../../../../../../common/js/api',
    '../../../../../../common/js/msg',
    '../../../../../../../xcom/imageviewer/imageviewer'
], function (api, msg, imageViewer) {

    'use strict';

    var $ = window.jQuery;
    var isOnline = (Number(GlobalInfo.status) >= 4);

    /**
     * 对uploader的实例进行对象方法扩展
     * @param {Uploader} uploader
     */
    function inject (uploader) {
        /**
         * 初始化一些表单关联属性
         * @param {Object} config
         */
        uploader.initFormAttrInternal = function (config) {
            this.$container = $(config.container);
            this.$thumbnail = this.$container.find('.o-thumbnail');
            this.$picker = this.$container.find('.o-filepicker');
            this.$sample = this.$container.parent().find('.sample');
            this.$quote = this.$container.parent().find('.tip em');
            this.$error = this.$container.parent().find('.error');

            this.keyName = config.keyName;
            this.keyValue = config.keyValue || '';
        };

        /**
         * 返回键值对
         * @returns {*}
         */
        uploader.getKeyValue = function () {
            return {
                name: this.keyName,
                value: this.keyValue
            };
        };

        /**
         * 验证是否合法
         * @returns {Object}
         */
        uploader.validate = function () {
            var ret = !!this.keyValue;
            if (ret) {
                this.$error.hide();
            } else {
                this.$error.show();
            }
            return ret;
        };

        /**
         * 根据是否上传过图片，显示不同视图
         * @param {string} imgUrl
         */
        uploader.setStateInternal = function (imgUrl) {
            if (imgUrl) {
                this.$picker.hide();
                this.$thumbnail.find('img').attr('src', imgUrl);
                this.$thumbnail.on('mouseenter', function () {
                    $(this).children('.o-remove').show()
                        .end().children('.o-hover').show();
                }).on('mouseleave', function () {
                    $(this).children('.o-remove').hide()
                        .end().children('.o-hover').hide();
                });

                this.initExist(this.$thumbnail, {
                    0: {
                        data: {
                            filehash: imgUrl
                        },
                        errno: 0
                    }
                });
            } else {
                this.$thumbnail.remove();
            }
        };

        /**
         * 额外绑定一些事件
         */
        uploader.bindInternal = function () {
            var me = this;
            // 显示样例
            if (this.$quote) {
                this.$quote.hover(function() {
                    me.$sample.show();
                }, function() {
                    me.$sample.hide();
                });
            }

            function post () {
                var postData = {
                    bdstoken: GlobalInfo.bdstoken
                };
                var kv = me.getKeyValue();
                postData['data[' + kv.name + ']'] = kv.value;
                $.post(api.zhida.updateQua, postData).done(function (res) {
                    if (res.error_code) {
                        me.$error.show();
                        me.$error.text(msg[res.error_code] || res.error_msg);
                    } else {
                        me.$error.hide();
                        me.$error.text('');
                    }
                });
            }

            // 上传成功实时保存
            this.uploader.on('uploadSuccess', function (file, response) {
                if (response.error_code) {
                    me.$error.show();
                    me.$error.text(msg[response.error_code] || response.error_msg);
                } else {
                    me.$error.hide();
                    me.keyValue = response.data.filehash;

                    // 没有上线的话实时保存
                    if (!isOnline) {
                        post();
                    }
                }
            });

            // 删除
            this.on('remove', function (uploader) {
                uploader.keyValue = '';
            });

            // 查看大图
            this.$container.delegate('.view-origin', 'click', function () {
                imageViewer.init();
                var imgurl = me.response.data ?
                    me.response.data.filehash :
                    me.existData[0].data.filehash;
                imageViewer.open(imgurl, 100000);
            });
        };
    }

    return inject;
});