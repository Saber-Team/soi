/**
 * @fileoverview logo字段对uploader实例扩展一些约定的方法
 * @email zhangshen04@baidu.com
 */

define(function (require, exports, module) {

    'use strict';

    var api = require('../../../../../../common/js/api'),
      msg = require('../../../../../../common/js/msg'),
      imageViewer = require('../../../../../../../xcom/imageviewer/imageviewer');

    var $ = window.jQuery;
    var tmpl =
        '<div class="o-thumbnail o-upload-done" data-order="{{index}}">' +
            '<img src="">' +
            '<div class="o-remove" style="display: none;"></div>' +
            '<div class="o-hover">' +
                '<span><div class="view-origin"></div></span>' +
                '<span><div class="re-upload"></div></span>' +
            '</div>' +
        '</div>';

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
            this.$thumbnail = null;
            this.$picker = this.$container.find('.o-filepicker');
            this.$error = this.$container.parent().find('.error');

            this.keyName = config.keyName;
            // 服务端产出是倒序
            this.keyValue = (config.keyValue || []).reverse();
        };

        /**
         * 返回键值对
         * @returns {*}
         */
        uploader.getKeyValue = function () {
            return {
                name: this.keyName,
                value: JSON.stringify(this.keyValue)
            };
        };

        /**
         * 验证是否合法
         * @returns {Object}
         */
        uploader.validate = function () {
            return true;
        };

        /**
         * 根据是否上传过图片，显示不同视图
         * @param {Array} imgUrlObj
         */
        uploader.setStateInternal = function (imgUrlObj) {
            var me = this;
            if (imgUrlObj.length) {
                // 服务端产出是倒序
                this.keyValue = (imgUrlObj || []).reverse();
                var html = '', existData = {};
                for (var i = 0; i < this.keyValue.length; ++i) {
                    html += tmpl.replace('{{index}}', i);
                    existData[i] = {
                        data: {
                            filehash: this.keyValue[i]
                        },
                        errno: 0
                    }
                }

                this.$container.prepend(html);
                // this.$picker.hide();
                this.fileNumCount >= this.conf.fileNumLimit ? this.hideUploader(): this.showUploader();

                this.$thumbnail = this.$container.find('.o-thumbnail');
                this.$thumbnail.on('mouseenter', function () {
                    $(this).children('.o-remove').show()
                        .end().children('.o-hover').show();
                }).on('mouseleave', function () {
                    $(this).children('.o-remove').hide()
                        .end().children('.o-hover').hide();
                });

                this.$thumbnail.find('img').each(function(index) {
                    $(this).attr('src', me.keyValue[index]);
                });

                this.initExist(this.$thumbnail, existData);
            }
        };

        /** 额外绑定一些事件 */
        uploader.bindInternal = function () {
            var me = this;

            function post () {
                var postData = {
                    bdstoken: GlobalInfo.bdstoken
                };
                postData['new_data[' + me.keyName + ']'] = JSON.stringify(me.keyValue);
                $.post(api.zhida.updateZhidaInfo, postData).done(function (res) {
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
                    me.$error.text('');

                    var res = me.getRes();
                    me.keyValue = [];
                    // 服务端返回是倒序
                    for (var i = res.length - 1; i >= 0; i--) {
                        me.keyValue.push(res[i].data.filehash);
                    }
                    // 没有上线的话实时保存
                    if (!isOnline) {
                        post();
                    }
                }
            });

            // 删除图片
            this.on('remove', function () {
                var res = me.getRes();
                me.keyValue = [];
                // 服务端返回是倒序
                for (var i = res.length - 1; i >= 0; i--) {
                    me.keyValue.push(res[i].data.filehash);
                }
                // 没有上线的话实时保存
                if (!isOnline) {
                    post();
                }
            });

            // 查看大图
            this.$container.delegate('.view-origin', 'click', function () {
                imageViewer.init();
                var imgurl = $(this).parent()
                    .parent().parent()
                    .find('img').attr('src');
                imageViewer.open(imgurl, 100000);
            });
        };
    }

    module.exports = inject;
});