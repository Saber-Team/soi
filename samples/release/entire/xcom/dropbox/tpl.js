/**
 * @fileOverview 表单输入域模板
 * @email zhangshen04@baidu.com
 */

define(function() {

    'use strict';

    var tpl =
        '<div class="o-dropbox" data-name="{{name}}" data-value="{{value}}">' +
            '<div class="box"><div class="txt">{{text}}</div><i></i></div>' +
            '<ul></ul>' +
        '</div>';

    return {
        template: tpl,
        re: /(?:\{\{([^}]*)}})/g
    };

});