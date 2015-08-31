/**
 * @fileOverview 表单输入域模板
 * @email zhangshen04@baidu.com
 */

define(function() {

    'use strict';

    var tpl =
        '<div class="o-inputfield" data-name="{{name}}">' +
            '<div class="box">' +
                '<input type="text" value="{{value}}" name="{{name}}" maxlength="{{maxLength}}"/>' +
                '<i><em>0</em>/{{maxLength}}</i>' +
            '</div>' +
            '<div class="error">{{errmsg}}</div>' +
            '<div class="tip">{{texttip}}</div>' +
        '</div>';

    return {
        template: tpl,
        re: /(?:\{\{([^}]*)}})/g
    };

});