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
}


utils.inherits(ImageResource, Resource);


/**
 * 生成目标文件
 */
ImageResource.prototype.create = function() {
  var ret = utils.getFileHash(this.original, null);
  var ext = path.extname(this.original);
  // var fname = path.basename(this.original, ext);

  // make directory
  soi.fs.mkdir(this.dist);

  var p = this.dist + '/' + ret.base64 + ext;
  soi.log.info('Create static resource file located at:\n  ' + p);
  soi.fs.writeFile(p, ret.content);
};


// 导出
module.exports = ImageResource;
