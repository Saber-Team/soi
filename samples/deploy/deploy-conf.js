/**
 * @fileoverview 远程测试的配置文件样例
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

'use strict';

soi.config.extend({
    // 配置节点
    deploy: {
        receiver: 'http://your.website.com:8080/recerver.php',
        method: 'post',
        params: {
            rootDir: '/User/acemood/demo/static' // 要被复制到的目录
        },
        // 文件的映射, from本地目录中的文件将会被复制到to的目录中,
        // from相对于server-conf.js文件取相对位置,
        // to则取rootDir的相对位置.
        // from和to支持glob形式的匹配, 也支持自己写逻辑的函数返回字符串
        // 关于glob规范见: https://www.npmjs.com/package/glob
        files: [
            {
                from: 'src/page/*.html',
                to: 'page/'
            },
            {
                from: 'src/static/js/*.js',
                to: 'static/js/'
            },
            {
                from: function() {
                    return 'src/static/css/*.css'
                },
                to: function() {
                    return 'static/css/'
                }
            }
        ]
    }
});
