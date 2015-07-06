/**
 * @fileoverview tpl类
 */

'use strict';

var path = require('path');
var fs = require('fs');

var utils = require('../utils');
var Resource = require('./resource');


/**
 * tpl类.
 * @constructor
 */
function TplResource(config) {
    Resource.call(this, config);
    // 没必要获取唯一名?
    this.getHashId();
}


utils.inherits(TplResource, Resource);


/**
 * 生成目标文件
 * @param {Object} OPTIONS 配置对象
 */
TplResource.prototype.createFile = function(OPTIONS) {
    var base = path.basename(this.original);

    // 写入文件
    soi.fs.mkdir(this.dist);

    var p = this.dist + '/' + base;
    soi.log.info('Create file located at:\n  ' + p);

    // todo 抽离replacer
    if (OPTIONS.replace) {
        this.cachedContent = this.cachedContent.replace(
            OPTIONS.replace.from, OPTIONS.replace.to);
    }

    soi.fs.writeFile(p, this.cachedContent);
    // 不存储缓存内容
    delete this.cachedContent;
};


/**
 * 返回当前资源的hash值
 * @return {String}
 */
TplResource.prototype.getHashId = function() {
    var ret = utils.getFileHash(this.original, 'utf8');
    this.hashId = ret.base64;
    this.cachedContent = ret.content;
    // 事先无法知道to的具体值，在这里更新
    this.to = soi.utils.normalizeSysPath(
        path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));
};


// 导出
module.exports = TplResource;
