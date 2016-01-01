/**
 * @file hash/md5插件,为文件加上指纹. 覆盖`resolveProductUriInternal`方法
 * @author AceMood
 * @email zmike86@gmail.com
 * @note 用到的path.format|path.parse方法在node v0.10.x不支持.
 */

var path = require('path');
var crypto = require('crypto');

var proto = {
  init: function(task) {
    var plug = this;
    plug.host = task;
    // 保留原始方法
    plug._reservedMethod = task.resolveProductUriInternal;
    // override
    task.resolveProductUriInternal = function(resource) {
      plug._reservedMethod.call(task, resource);
      if (resource.type === 'CSS'
          || resource.type === 'JS'
          || resource.type === 'Image') {
        var sum = crypto.createHash(plug.options.algorithm);
        sum.update(resource.getContent());
        var hash = sum.digest(plug.options.encoding)
            .replace(/\//g, '_')
            .substr(0, plug.options.length);

        // https://nodejs.org/docs/latest-v0.12.x/api/path.html#path_path_parse_pathstring
        var pathObj = path.parse(resource.uri);
        if (plug.options.noname) {
          pathObj.base = hash + pathObj.ext;
        } else {
          pathObj.base = hash + plug.options.connector + pathObj.base;
        }
        resource.uri = path.format(pathObj);
      }
    };
  },
  uninstall: function() {
    this.host.resolveProductUriInternal = this._reservedMethod;
    delete this._reservedMethod;
  }
};

function Fingerprint(options) {
  options = options || {};
  this.options = options || Object.create(null);
  this.options.algorithm = options.algorithm || 'md5';
  this.options.encoding = options.encoding || 'base64';
  this.options.length = options.length || 9;
  this.options.noname = !!options.noname;
  this.options.connector = options.connector || '.';
}

Fingerprint.prototype = Object.create(proto);

module.exports = Fingerprint;