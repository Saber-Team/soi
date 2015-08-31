'use strict';


/**
 * release和deploy的配置对象
 * @type {Object}
 */
var CONFIG = require('./__CONFIG__');


/**
 * 根据模块名和页面id动态生成release的配置对象
 * @returns {Object}
 */
function composeReleasePack() {
    var packObj = Object.create(null);
    // 模板
    packObj.tpl = [
        {
            files: ['merchant/common/tpl/*.*'],
            to: '/template/common/page/'
        },
        {
            files: ['merchant/navbar/*.*'],
            to: '/template/navbar/'
        }
    ];
    // 图像
    packObj.img = [
        {
            files: [
                'merchant/common/img/*.*',
                'xcom/uploader/*.png',
                'xcom/logoupload/*.@(png|gif)'
            ],
            to: '/static/merchant/common/img/'
        }
    ];
    // 样式表
    packObj.css = [];
    // javascript
    packObj.js = [
        {
            modular     : 'normal',
            files       : ['xlib/js/kernel.js', 'xlib/js/jQuery.js'],
            to          : '/static/merchant/common/js/',
            placeholder : 'base'
        },
        {
            modular     : 'normal',
            files       : ['xcom/uploader/webuploader.js'],
            to          : '/static/merchant/common/js/',
            placeholder : 'base:uploader'
        },
        {
            modular     : 'normal',
            files       : [
                'xcom/logoupload/FileAPI.js',
                'xcom/logoupload/jquery.fileapi.js',
                'xcom/logoupload/jquery.jcrop.js'
            ],
            to          : '/static/merchant/common/js/',
            placeholder : 'base:logouploader'
        },
        {
            modular     : 'normal',
            files       : ['xlib/js/ZeroClipboard.js'],
            to          : '/static/merchant/common/js/',
            placeholder : 'base:clipboard'
        }
    ];

    //flash文件
    packObj.swf = [
        {
            files: [
                'xcom/uploader/*.swf',
                'xcom/logoupload/*.swf'
            ],
            to: '/static/merchant/common/swf/'
        }
    ];

    // 生成release配置对象
    CONFIG.content.forEach(function(conf) {
        var subModuleId = conf.subModuleId,
            moduleId = conf.moduleId,
            pageId = conf.pageId;

        packObj.tpl.push({
            files: ['merchant/' + moduleId + '/src/page/' + subModuleId + '/*.*'],
            to: '/template/' + moduleId + '/page/' + subModuleId + '/'
        });
        packObj.img.push({
            files: ['merchant/' + moduleId + '/src/static/img/' + subModuleId + (pageId ? '/' + pageId : '') + '/*.*'],
            to: '/static/merchant/' + moduleId + '/img/' + subModuleId + (pageId ? '/' + pageId : '') + '/'
        });
        packObj.css.push({
            modular     : true,
            entrance    : 'merchant/' + moduleId + '/src/static/css/' + subModuleId + (pageId ? '/' + pageId : '') + '/app.css',
            to          : '/static/merchant/' + moduleId + '/css/' + subModuleId + (pageId ? '/' + pageId : '') + '/',
            placeholder : 'merchant:' + moduleId + ':' + subModuleId + (pageId ? ':' + pageId : '')
        });
        packObj.js.push({
            modular     : 'amd',
            entrance    : 'merchant/' + moduleId + '/src/static/js/' + subModuleId + (pageId ? '/' + pageId : '') + '/app.js',
            to          : '/static/merchant/' + moduleId + '/js/' + subModuleId + (pageId ? '/' + pageId : '') + '/',
            placeholder : 'merchant:' + moduleId + ':' + subModuleId + (pageId ? ':' + pageId : '')
        });
    });

    return packObj;
}

/**
 * 根据模块名和页面id动态生成deploy的配置对象
 * @returns {Array}
 */
function composeDeploy() {
    var files = [
        /* 基类模板 */
        {
            from: 'build/template/common/page/*.*',
            to: 'template/common/page/'
        },
        /* 商户后台公用静态文件 */
        {
            from: 'build/static/merchant/common/js/*.*',
            to: 'static/merchant/common/js/'
        },
        {
            from: 'build/static/merchant/common/img/*.*',
            to: 'static/merchant/common/img/'
        },
        {
            from: 'build/static/merchant/common/swf/*.*',
            to: 'static/merchant/common/swf/'
        },
        /* 左侧导航 */
        {
            from: 'build/template/navbar/*.*',
            to: 'template/navbar/'
        }
    ];

    // 生成deploy配置对象
    CONFIG.content.forEach(function(conf) {
        var subModuleId = conf.subModuleId,
            moduleId = conf.moduleId,
            pageId = conf.pageId;

        files = files.concat([
            {
                from: 'build/template/' + moduleId + '/page/' + subModuleId + '/*.*',
                to: 'template/' + moduleId + '/page/' + subModuleId + '/'
            },
            {
                from: 'build/static/merchant/' + moduleId + '/js/' + subModuleId + (pageId ? '/' + pageId : '') + '/*.js',
                to: 'static/merchant/' + moduleId + '/js/' + subModuleId + (pageId ? '/' + pageId : '') + '/'
            },
            {
                from: 'build/static/merchant/' + moduleId + '/css/' + subModuleId + (pageId ? '/' + pageId : '') + '/*.css',
                to: 'static/merchant/' + moduleId + '/css/' + subModuleId + (pageId ? '/' + pageId : '') + '/'
            },
            {
                from: 'build/static/merchant/' + moduleId + '/img/' + subModuleId + (pageId ? '/' + pageId : '') + '/*.*',
                to: 'static/merchant/' + moduleId + '/img/' + subModuleId + (pageId ? '/' + pageId : '') + '/'
            }
        ]);
    });

    return files;
}


soi.config.extend({
    // 配置节点
    deploy: {
        receiver: 'http://dbl-dev-rd22.vm.baidu.com:8343/receiver',
        // 要被复制到的目录，替换成远程绝对路径
        dist: '/home/work/webroot/templates/templates/eva_merchant_' + CONFIG.user,
        // 文件的映射, from 本地目录中的文件将会被复制到 to 的目录中,
        // from 相对于`process.cwd()`取相对位置,
        // to 则取`dist`的相对位置.
        // from 和 to 支持glob形式的匹配, 也支持自己写逻辑的函数返回字符串
        // 关于glob规范见: https://www.npmjs.com/package/glob
        files: composeDeploy()
    },
    release: {
        // virtualRootDir (vrd) 这个属性非常重要。它的出现有几点意义，
        // 1. 它代表网络根路径，所有本地的静态资源都要相对这个目录生成path部分，从而产生绝对路径类似于
        //    `/static/scripts/lib/jQuery.js`。用到的是pack中的entrance属性。
        // 2. 之所以没有用系统的绝对路径是因为可能打包的系统各异，生成的资源表的key不好统一。
        //    在此生成的绝对路径作为最终资源表中的key存在，不会重复，且在各个系统中统一。
        // 3. 根据配置的domain，生成线上绝对路径。用到的是pack中的to属性
        prod: {
            obscure: false,
            charset: 'utf8',
            domain: '/',
            virtualRootDir: '../',
            distRootDir: './build/',
            mapTo: './map.json',

            pack: composeReleasePack(),
            replace: {
                from: /(__TOPBAR__|__NAVBAR__|__APIDOMAIN__|__UPLOAD__|__SWF__|__FILE_API_STATIC__)/g,
                to: function($0) {
                    if ($0 === '__TOPBAR__') {
                        return 'http://zhida.baidu.com:8080';
                    } else if ($0 === '__NAVBAR__') {
                        return 'http://' + CONFIG.user + '.zhida.baidu.com:8080';
                    } else if ($0 === '__APIDOMAIN__') {
                        return 'http://' + CONFIG.user + '.zhida.baidu.com:8080/';
                    } else if ($0 === '__SWF__' ||
                        $0 === '__FILE_API_STATIC__') {
                        return 'http://' + CONFIG.user + '.zhida.baidu.com:8080'
                    } else if ($0 === '__UPLOAD__') {
                        return 'http://' + CONFIG.user + '.zhida.baidu.com:8080/v3/upload'
                    }
                }
            }
        },
        online: {
            obscure: true,
            charset: 'utf8',
            domain: 'http://apps.bdimg.com/developer/',
            virtualRootDir: '../',
            distRootDir: './build/',
            mapTo: './map.json',

            pack: composeReleasePack(),
            replace: {
                from: /(__TOPBAR__|__NAVBAR__|__APIDOMAIN__|__UPLOAD__|__SWF__|__FILE_API_STATIC__)/g,
                to: function($0) {
                    if ($0 === '__TOPBAR__' ||
                        $0 === '__NAVBAR__') {
                        return 'http://zhida.baidu.com'
                    } else if ($0 === '__APIDOMAIN__') {
                        return 'http://zhida.baidu.com/'
                    } else if ($0 === '__SWF__' ||
                        $0 === '__FILE_API_STATIC__') {
                        return 'http://apps.bdimg.com/developer'
                    } else if ($0 === '__UPLOAD__') {
                        return 'http://zhida.baidu.com/v3/upload'
                    }
                }
            }
        }
    }
});
