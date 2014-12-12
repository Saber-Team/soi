/**
 * @fileoverview 服务端接口
 * @author Leo.Zhang(zmike86)
 */

define('HMT.Service',
    [
        '@util',
        '@string.util',
        '@net.XhrIo'
    ],
    function(util, string, XhrIo) {

        'use strict';


        var URL_GETPID = 'http://haoma.sogou.com/discount/req_numcode.php';
        var URL_CHECKPID = 'http://haoma.sogou.com/discount/req_discode.php';


        /**
         * 发送手机号码获取验证码.
         * 返回结果：0表示已无验证码，1表示成功，-1表示已领取，-2表示服务器错误
         * @param {Function} cb 回调函数
         * @param {ArrayBuffer|Blob|Document|FormData|string=} data 要发送的数据,只在post请求用
         */
        function getPid (cb, data) {
            cb = cb || util.nullFunction;
            data = 'number=' + data;
            XhrIo.send(URL_GETPID, cb, 'POST', data);
        }


        /**
         * 提交验证码.
         * 返回结果：0表示已无验证码，1表示成功，-1表示验证失败，-2表示服务器错误
         * @param {Function} cb 回调函数
         * @param {ArrayBuffer|Blob|Document|FormData|string=} number 要发送的数据,只在post请求用
         * @param {ArrayBuffer|Blob|Document|FormData|string=} code 要发送的数据,只在post请求用
         */
        function sendPid (cb, number, code) {
            cb = cb || util.nullFunction;
            var data = string.subs('number=%s&code=%s', number, code);
            XhrIo.send(URL_CHECKPID, cb, 'POST', data);
        }

        return {
            getPid: getPid,
            sendPid: sendPid
        };
    }
);