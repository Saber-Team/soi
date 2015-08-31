/**
 * @fileoverview logo字段对uploader实例扩展一些约定的方法
 * @email zhangshen04@baidu.com
 */

define(function (require, exports, module) {

    'use strict';

    var api = require('../../../../../../common/js/api'),
      msg = require('../../../../../../common/js/msg');

    var $ = window.jQuery;
    var data = null;
    var defaultErrorMsg = '未上传图片';
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
            this.$error = this.$container.parent().find('.error');
        };

        /**
         * 返回键值对
         * @returns {*}
         */
        uploader.getKeyValue = function () {
            return data;
        };

        /**
         * 验证是否合法
         * @returns {Object}
         */
        uploader.validate = function () {
            var ret = !!data;
            if (ret) {
                this.$error.hide();
                this.$error.text('');
            } else {
                this.$error.show();
                this.$error.text(defaultErrorMsg);
            }
            return ret;
        };

        /**
         * 根据是否上传过图片，显示不同视图
         * @param {?Object} imgUrlObj
         */
        uploader.setStateInternal = function (imgUrlObj) {
            if (imgUrlObj) {
                data = imgUrlObj;
            } else {}
        };

        /** 额外绑定一些事件 */
        uploader.bindInternal = function () {
            var me = this;

            function post () {
                var postData = {
                    bdstoken: GlobalInfo.bdstoken
                };
                if (GlobalInfo.app_id) {
                    postData.app_id = GlobalInfo.app_id;
                }
                for (var n in data) {
                    if (data.hasOwnProperty(n)) {
                        postData['new_data[' + n + ']'] = data[n];
                    }
                }
                $.post(api.zhida.updateZhidaInfo, postData).done(function (res) {
                    if (res.error_code) {
                        me.$error.show();
                        me.$error.text(res.error_msg);
                    } else {
                        me.$error.hide();
                        me.$error.text('');
                    }
                });
            }

            // 上传成功实时保存
            uploader.opts.onFileComplete = function (evt, uploadInfo) {
                if (uploadInfo.result
                    && uploadInfo.result.data) {
                    var err_code = uploadInfo.result.data.error_code;
                    if (err_code) {
                        me.$error.show();
                        me.$error.text(msg[err_code] || uploadInfo.result.data.error_msg);
                    } else {
                        me.$error.hide();
                        me.$error.text('');

                        data = uploadInfo.result.data.filehash;
                        // 没有上线的话实时保存
                        if (!isOnline) {
                            post();
                        }
                    }
                }
            };
        };
    }

    module.exports = inject;
});