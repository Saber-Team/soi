/**
 * @fileoverview 测试是否联网
 * @author Leo.Zhang(zmike86)
 */

define(['../../lib/util/util'], function(util) {
    'use strict';

    var url = 'http://www.sogou.com/images/logo/new/sogou.png';

    /**
     * 试图通过原生支持得到是否联网.
     * @return {boolean} Whether navigator.onLine returns false.
     * @private
     */
    function getNavigatorOffline() {
        return 'onLine' in navigator && !navigator.onLine;
    }

    /**
     * 每次请求不同地址防止缓存
     * @returns {string}
     */
    function makeUnique() {
        return url + '?' + (+new Date())
    }

    /**
     * 开始测试是否联网
     * @param {Function} fn 回调函数
     */
    function test(fn) {
        if (getNavigatorOffline()) {
            fn(false);
        } else {
            var img = new Image();
            img.onload = function() {
                img.onload = null;
                fn(true);
            };
            img.onerror = img.onabort = function() {
                img.onerror = img.onabort = null;
                fn(false);
            };

            img.src = makeUnique();
        }
    }

    return {
        test: test
    };
});