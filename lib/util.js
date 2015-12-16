/**
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
 * 判断对象是否为空,
 * @param obj
 * @returns {Boolean}
 */
_util.isEmpty = function (obj) {
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
 * @param  {String}  path 路径
 * @return {Boolean}      true为是
 */
_util.isFile = function (path) {
    return _util.exists(path) && fs.statSync(path).isFile();
};

/**
 * 是否为文件夹
 * @param  {String}  path 路径
 * @return {Boolean} true为是
 */
_util.isDir = function(path) {
    return _util.exists(path) && fs.statSync(path).isDirectory();
};

/**
 * 创建文件夹
 * @param  {String} path 路径
 * @param  {Number} mode 创建模式
 */
_util.mkdir = function (path, mode) {
    if (typeof mode === 'undefined') {
        mode = 511 & (~process.umask());
    }
    if (_util.exists(path)) {
        return;
    }
    path.split('/').reduce(function (prev, next) {
        if (prev && !_util.exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + '/' + next;
    });
    if (!_util.exists(path)) {
        fs.mkdirSync(path, mode);
    }
};

/**
 * 按位数生成hash串
 * @param  {String|Buffer} data 数据源
 * @param  {type} 加密类型, md5 sha1 等, 默认是使用 sha1
 * @param  {Number} len  需要生成的hash串长度，默认是9
 * @return {String} hash串
 */
_util.getDataHash = function (data, type, len) {
    var sum = crypto.createHash(type || 'sha1'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    sum.update(data, encoding);
    return sum.digest('base64').replace(/\//g, '_').substr(0, len || 9);
};

/**
 * 获取规则类型
 * @param pattern
 * @returns {*}
 */
_util.normalize = function (pattern) {
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
 * @param  {String} pattern
 * @param  {String} path 需要判断的路径
 * @param  {String} options
 */
_util.glob = function (pattern, path, options) {
    // 当path存在路径时,直接判断是不是满足匹配规则
    if (path && typeof path === 'string') {
        return minimatch(path, pattern, {matchBase: true});
    }

    // 当用户配置 *.js 这种写法的时候，需要让其命中所有所有目录下面的。
    if (/^(\(*?)(?!\:|\/|\(|\*\*)(.*)$/.test(pattern)) {
        pattern = '**/' + pattern;
    }
    var regex = minimatch.makeRe(pattern, options || {matchBase: true});

    return new RegExp(regex.source, regex.ignoreCase ? 'i' : '');
};

/**
 * 读取JSON文件
 * @param {String} path
 * @returns {string} 返回json串
 */
_util.readJSON = function (path) {
    var content = '',
        result = '';
    if (_util.exists(path)) {
        content = fs.readFileSync(path);
        try {
            result = JSON.parse(content);
        } catch (e) {
            soi.log.error('parse json file [%s] fail, error [%s]', path, e.message);
        }
        return result;
    }
    else {
        soi.log.error('unable to read file [%s]: No such file or directory', path);
    }
};

/**
 * 删除指定文件或者某一个目录下的所有文件, 针对编译生成的文件.
 * @param {String} path
 */
_util.delete = function (path) {
    if (path && _util.exists(path)) {
        var stat = fs.lstatSync(path);

        if (stat.isDirectory()) {
            fs.readdirSync(path).forEach(function(name) {
                if (name !== '.' && name !== '..') {
                    fs.unlinkSync(path + '/' + name);
                }
            });
            fs.rmdirSync(path);
            soi.log.ok('delete directory [' + path + ']: success');
        }
        else if (stat.isFile()) {
            fs.unlinkSync(path);
            soi.log.ok('delete file [' + path + ']: success');
        }
        else {
            soi.log.error('unable to delete [' + path + ']: No such file or directory');
        }
    }
    else {
        soi.log.error('unable to delete [' + path + ']: No such file or directory');
    }
};

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {String} url
 * @returns {Boolean}
 */
_util.isAbsUrl = function (url) {
    return /:\//.test(url);
};

/**
 * 判断给定路径是否绝对路径
 * @param {String} path
 * @returns {Boolean}
 */
_util.isAbsPath = function (path) {
    if (process.platform.indexOf('win') !== -1) {
        return /^[a-z]:/i.test(path);
    }
    else {
        return (path[0] === '/' || path[0] === '~')
    }
};

/**
 * 将windows路径中的 `\\` 转化成unix的 `/`;
 * @param {String} p
 * @returns {string}
 */
_util.normalizeSysPath = function (p) {
    // 传来的参数有可能是path.normalize得来的，
    // 这个方法会把http开头的绝对路径中协议部分替换成单个`/`
    if (_util.isAbsUrl(p)) {
        return p.replace(/^(https?:\/)(?:\/)?(.*)/, function($0, $1, $2) {
            var np = path.normalize($2);
            if (np.charAt(0) === '/') {
                return $1 + $2;
            } else {
                return $1 + '/' + $2;
            }
        })
    } else {
        return path.normalize(p).replace(/\\/g, '/');
    }
};

/**
 * 对象枚举元素遍历
 * @param  {Object}   obj      源对象
 * @param  {Function|Object} callback 回调函数|目标对象
 * @param  {Boolean}   merge    是否为对象赋值模式
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

_util.parseUrl = function (url, opt) {
    opt = opt || {};
    url = Url.parse(url);
    var ssl = url.protocol === 'https:';
    opt.host = opt.host || opt.hostname || ((ssl || url.protocol === 'http:') ? url.hostname : 'localhost');
    opt.port = opt.port || (url.port || (ssl ? 443 : 80));
    opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
    opt.method = opt.method || 'GET';
    opt.agent = opt.agent || false;
    return opt;
};

_util.upload = function (url, data, content, filename, callback) {
    if (typeof content === 'string') {
        content = new Buffer(content, 'utf8');
    }
    else if (!(content instanceof Buffer)) {
        soi.log.error('unable to upload content [%s]', (typeof content));
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