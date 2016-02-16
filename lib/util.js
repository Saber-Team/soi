/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file soi工具类操作集合
 * @author XCB
 */

var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    util = require('util'),
    Url = require('url'),
    minimatch = require('minimatch');

var _util = module.exports = {};

_util.toString = Object.prototype.toString;
_util.isArray = util.isArray;
_util.exists = fs.existsSync || path.existsSync;

/**
 * 判断对象是否是对象类型
 * @param {Object} o
 * @returns {boolean}
 */
_util.isObject = function(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
};

/**
 * 判断对象是否为空,
 * @param {*} obj
 * @returns {Boolean}
 */
_util.isEmpty = function(obj) {
  if (obj == null) return true;
  if (_util.isArray(obj)) return !!obj.length;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

/**
 * 是否为一个文件
 * @param  {string}  fpath 路径
 * @return {boolean} true为是
 */
_util.isFile = function(fpath) {
  return _util.exists(fpath) && fs.statSync(fpath).isFile();
};

/**
 * 是否为文件夹
 * @param  {string}  fpath 路径
 * @return {boolean} true为是
 */
_util.isDir = function(fpath) {
  return _util.exists(fpath) && fs.statSync(fpath).isDirectory();
};

/**
 * 创建目录
 * @param {string} fpath 要创建的目录的路径
 * @param {number} mode 创建模式
 */
_util.mkdir = function(fpath, mode) {
  if (_util.exists(fpath)) {
    return;
  }

  if (typeof mode === 'undefined') {
    mode = 511 & (~process.umask());
  }

  fpath.split(path.sep).reduce(function(prev, next) {
    if (prev && !_util.exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + path.sep + next;
  });

  if (!_util.exists(fpath)) {
    fs.mkdirSync(fpath, mode);
  }
};

/**
 * 按位数生成hash串
 * @param  {string|Buffer} data 数据源
 * @param  {string} type 加密类型, md5 sha1 等, 默认是使用 sha1
 * @param  {number} len  需要生成的hash串长度，默认是9
 * @return {string} hash串
 */
_util.getDataHash = function(data, type, len) {
  var sum = crypto.createHash(type || 'sha1'),
      encoding = typeof data === 'string' ? 'utf8' : 'binary';
  sum.update(data, encoding);
  return sum.digest('base64').replace(/\//g, '_').substr(0, len || 9);
};

/**
 * 获取规则类型
 * @param {string|RegExp} pattern
 * @returns {RegExp}
 */
_util.normalize = function(pattern) {
  var type = _util.toString.call(pattern);
  switch (type) {
    case '[object String]':
      return _util.glob(pattern);
    case '[object RegExp]':
      return pattern;
    default:
      soi.log.error('invalid regexp [%s]', pattern);
  }
};

/**
 * 模拟linux glob文法实现, eg. '*.js'匹配所有的js文件
 * @param {string} pattern
 * @param {string} fpath 需要判断的路径
 * @param {string} options
 */
_util.glob = function(pattern, fpath, options) {
  // 当path存在路径时,直接判断是不是满足匹配规则
  if (fpath && typeof fpath === 'string') {
    return minimatch(fpath, pattern, {matchBase: true});
  }

  // 当用户配置 *.js 这种写法的时候，需要让其命中所有所有目录下面的。
  // if (/^(\(*?)(?!\:|\/|\(|\*\*)(.*)$/.test(pattern)) {
  if (/^\*\.[^\.\/]*$/.test(pattern)) {
    pattern = '**/' + pattern;
  }
  var regex = minimatch.makeRe(pattern);

  return new RegExp(regex.source, regex.ignoreCase ? 'i' : '');
};

/**
 * 读取JSON文件
 * @param {string} fpath
 * @returns {string} 返回json串
 */
_util.readJSON = function(fpath) {
  var content = '',
      result = '';
  if (_util.exists(fpath)) {
    content = fs.readFileSync(fpath);
    try {
      result = JSON.parse(content);
    } catch (e) {
      soi.log.error('parse json file ['+ fpath +'] fail, error [' + e + ']');
    }
    return result;
  }
  else {
    soi.log.error('unable to read file [' + fpath + ']: No such file or directory');
  }
};

/**
 * 删除指定文件或者某一个目录下的所有文件, 针对编译生成的文件.
 * @param {string} fpath
 */
_util.delete = function(fpath) {
  if (fpath && _util.exists(fpath)) {
    var stat = fs.lstatSync(fpath);

    if (stat.isDirectory()) {
      fs.readdirSync(fpath).forEach(function(name) {
        if (name !== '.' && name !== '..') {
          fs.unlinkSync(fpath + '/' + name);
        }
      });
      fs.rmdirSync(fpath);
      soi.log.fine('delete directory [' + fpath + ']: success');
    } else if (stat.isFile()) {
      fs.unlinkSync(fpath);
      soi.log.fine('delete file [' + fpath + ']: success');
    } else {
      soi.log.error('unable to delete [' + fpath + ']: No such file or directory');
    }
  } else {
    soi.log.error('unable to delete [' + fpath + ']: No such file or directory');
  }
};

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {string} url
 * @returns {boolean}
 */
_util.isAbsUrl = function(url) {
  return /:\//.test(url);
};

/**
 * 判断给定路径是否绝对路径
 * @param {String} fpath
 * @returns {Boolean}
 */
_util.isAbsPath = function(fpath) {
  if (process.platform.indexOf('win') !== -1) {
    return /^[a-z]:/i.test(fpath);
  }
  else {
    return (fpath[0] === '/' || fpath[0] === '~')
  }
};

/**
 * 对象枚举元素遍历
 * @param {object}   obj      源对象
 * @param {function|object} callback 回调函数|目标对象
 * @param {boolean}   merge    是否为对象赋值模式
 * @function
 */
_util.map = function(obj, callback, merge) {
  var index = 0;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (merge) {
        callback[key] = obj[key];
      } else if (callback(key, obj[key], index++)) {
        break;
      }
    }
  }
};

/**
 * 解析url
 * @param {string} url
 * @param {object} opt
 * @returns {*}
 */
_util.parseUrl = function (url, opt) {
  opt = opt || {};
  url = Url.parse(url);
  opt.host = opt.host || opt.hostname || url.hostname;
  opt.port = opt.port || url.port;
  opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
  opt.method = opt.method || 'GET';
  opt.agent = opt.agent || false;
  return opt;
};

/**
 * 文件上传方法,直接拼接参数, 从fis3的util中copy
 * @param {string} url 服务器的url
 * @param {object} data 上传需要带的一些参数,例如部署到服务器的路径
 * @param {string} content 需要上传文件的内容
 * @param {string} filename 需要上传文件的名称
 * @param {function} callback 上传成功或者失败的回调
 */
_util.upload = function(url, data, content, filename, callback) {
  if (typeof content === 'string') {
    content = new Buffer(content, 'utf8');
  }
  else if (!(content instanceof Buffer)) {
    soi.log.error('unable to upload content [' + (typeof content) + ']');
  }

  var endl = '\r\n';
  var boundary  = '-----np' + Math.random();
  var collect = [];

  _util.map(data, function(key, value) {
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
    collect.push(endl);
    collect.push(value + endl);
  });
  collect.push('--' + boundary + endl);
  collect.push('Content-Disposition: form-data; name="file"; filename="' + filename + '"' + endl);
  collect.push(endl);
  collect.push(content);
  collect.push('--' + boundary + '--' + endl);

  var length = 0;
  collect.forEach(function(ele) {
    length += ele.length;
  });
  var opt = _util.parseUrl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': length
    }
  });
  var http = require('http');
  var req = http.request(opt, function(res) {
    var status = res.statusCode;
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    }).on('end', function () {
      if (status >= 200 && status < 300 || status === 304) {
        callback(null, body);
      } else {
        callback(status);
      }
    }).on('error', function(err) {
      callback(err.message || err);
    });

  });
  collect.forEach(function(d) {
    req.write(d);
    if (d instanceof Buffer) {
      req.write(endl);
    }
  });
  req.end();
};

/**
 * 根据basename获取路径
 * @param {string} p 路径
 */
_util.basename = function(p) {
  return path.basename(p);
};

/**
 * 根据文件路径,计算相对路径,
 *  例如 文件路径是 src/static/css/main.css,
 *    其中img的路径是  ../img/banner.img,  则返回 src/static/img/banner.png
 * @param {String} from css的路径
 * @param {String} to 引用资源的路径
 * @returns {string|*} 相对路径
 */
_util.relativePath = function(from, to) {
  return path.join(path.dirname(from), to);
};

/**
 * 获取相对路径
 * @param {String} p 相对于那个路径
 * @param {String} name 文件名称
 * @returns {String} 返回相对路径
 */
_util.getPath = function(p, name) {
  return path.join(path.dirname(p), name);
};

/**
 * 异步写文件
 * @param {string} fpath 写入路径
 * @param {string|Buffer} content 文件内容
 * @param {?object} options
 * @param {function} callback 回调函数
 */
_util.writeFile = function(fpath, content, options, callback) {
  var dir = path.parse(fpath).dir;
  if (!_util.exists(fpath) && dir) {
    _util.mkdir(dir);
  }

  options = options || {};
  options.mode = 511 & (~process.umask());

  //console.log(mode);
  fs.writeFile(fpath, content, options, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, 'Saved: ' + fpath);
  });
};

/**
 * 合并Object
 * @param {object} target 需要合并到的对象
 * @param {object} src 合并对象
 * @param {boolean} deep 是否深度复制
 * @returns {*}
 */
_util.merge = function(target, src, deep) {
  if (!deep) {
    for(var k in src) {
      target[k] = src[k];
    }
  }
  else {
    if (_util.isObject(src)) {
      for (var key in src) {
        if (_util.isObject(src[key])) {
          target[key] = _util.merge(target[key] || {}, src[key], deep);
        } else if (_util.isArray(src[key])) {
          target[key] = _util.merge(target[key] || [], src[key], deep);
        } else {
          target[key] = src[key];
        }

      }
    } else if (_util.isArray(src)) {
      for (var i = 0; i < src.length; ++i) {
        if (_util.isObject(src[i])) {
          target[i] = target[i] || {};
          target[i] = _util.merge(target[i], src[i], deep);
        } else if (_util.isArray(src[i])) {
          target[i] = target[i] || [];
          target[i] = _util.merge(target[i], src[i], deep);
        } else {
          target[i] = src[i];
        }
      }
    } else {
      target = src;
    }
  }
  return target;
};

/**
 * 冻结方法
 * @param {object} obj
 * @param {Array} props
 */
_util.seal = function(obj, props) {
  props.forEach(function(prop) {
    Object.defineProperty(obj, prop, {
      writable: false,
      enumerable: true,
      value: obj[prop]
    });
  });
};

/**
 * 瘦身资源表保留 id type uri deps（如果有的话）
 * @param map 资源表
 * @return {string}
 */
_util.shimMap = function(map) {
  var m = {};
  _util.map(map.resourceMap, function(type, obj) {
    m[type] = {};
    soi.util.map(obj, function(key, item) {
      m[type][item.id] = {
        uri: item.uri,
        type: item.type,
        included: item.included || []
      };

      var required = (item.requiredCSS || []).concat(item.requiredModules || []);
      if ((type === 'JS' || type === 'CSS') &&
        required && required.length) {
        m[type][item.id].deps = required;
      }
    });
  });

  m.pkgs = map.pkgs.map(pkgId => {
    return {

    }
  });

  return JSON.stringify(m, null, 4);
};