/**
 * @fileOverview
 * 本文件包含商户后台所有模块、页面的需要打包的配置，
 * 任何人可以修改本文件条目
 *
 * Note: 模块化js和css入口文件的命名均以
 * app.js 和 app.css作为必须遵守的约定
 *
 * 且
 *
 * 目录规范必须以crm 和 zhida 为例
 */

'use strict';

module.exports = {
    user: 'zmike86',
    content: [
        //{moduleId: 'zhida',subModuleId: 'site',pageId: ''},
        //{moduleId: 'zhida',subModuleId: 'detail',pageId: ''},
        {moduleId: 'zhida', subModuleId: 'join', pageId: ''}
    ]
};
