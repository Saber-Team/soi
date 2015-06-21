/**
 * @fileoverview 图片资源类
 */

'use strict';

var path = require('path');
var fs = require('fs');

var utils = require('../utils');
var Resource = require('./resource');


/**
 * 单个图片资源类.
 * @constructor
 */
function ImageResource(config) {
  Resource.call(this, config);

  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.to = path.join(path.dirname(this.to), this.hashId + path.extname(this.to));
}


utils.inherits(ImageResource, Resource);


/**
 * 生成目标文件
 */
ImageResource.prototype.create = function() {
  var ret = utils.getFileHash(this.original, null);
  var ext = path.extname(this.original);

  // make directory
  soi.fs.mkdir(this.dist);

  var p = this.dist + '/' + ret.base64 + ext;
  soi.log.info('Create static resource file located at:\n  ' + p);
  soi.fs.writeFile(p, ret.content);
};


// 导出
module.exports = ImageResource;
