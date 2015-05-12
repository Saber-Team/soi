/**
 * @fileoverview 经过考虑启动本地server方便前端工程师调试的功能不做成插件了,
 *   而是内置为S.O.I的子功能. 通过server命令来操作.
 *   使用方法:
 *   # 启动本地服务器
 *     soi server --start --port 8888 --file conf.js
 *     或
 *     soi server -s -p 8888 -f conf.js
 *   # 叫停本地服务器
 *     soi server --stop
 *     或
 *     soi server -x
 *
 * @author AceMood(zmike86)
 * @email zmike86@gmail.com
 */

'use strict';

function start() {

}

function stop() {

}

exports.start = start;
exports.stop = stop;