/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file utilities functions
 * @author XCB
 */

'use strict';

const fs        = require('fs');
const path      = require('path');
const crypto    = require('crypto');
const util      = require('util');
const node_url  = require('url');
const node_path = require('path');
const minimatch = require('minimatch');
const toString  = Object.prototype.toString;
const exists    = exports.exists = function(path) {
    try {
        let stats = fs.statSync(path);
        return stats.isFile() || stats.isDirectory();
    } catch (e) {
        if (e.code !== 'ENOENT') {
            throw e;
        }
        return false;
    }
};

/**
 * 判断对象是否是对象类型
 * @param   {object} o
 * @returns {boolean}
 */
const isObject = exports.isObject = function(o) {
    return toString.call(o) === '[object Object]';
};

/**
 * 创建目录
 * @param {string} fpath 要创建的目录的路径
 * @param {number} mode 创建模式
 */
const mkdir = exports.mkdir = function(fpath, mode) {
    if (exists(fpath)) {
        return;
    }

    if (typeof mode === 'undefined') {
        mode = 511 & (~process.umask());
    }

    fpath.split(path.sep).reduce((prev, next) => {
        if (prev && !exists(prev)) {
            fs.mkdirSync(prev, mode);
        }
        return prev + path.sep + next;
    });

    if (!exists(fpath)) {
        fs.mkdirSync(fpath, mode);
    }
};

/**
 * 获取规则类型
 * @param {string|RegExp} pattern
 * @returns {RegExp}
 */
exports.normalize = function(pattern) {
    let type = toString.call(pattern);
    switch (type) {
        case '[object String]':
            return glob(pattern);
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
const glob = exports.glob = function(pattern, fpath, options) {
    // 当path存在路径时,直接判断是不是满足匹配规则
    if (fpath && typeof fpath === 'string') {
        return minimatch(fpath, pattern, {matchBase: true});
    }

    // 当用户配置 *.js 这种写法的时候，需要让其命中所有目录下面的。
    // if (/^(\(*?)(?!\:|\/|\(|\*\*)(.*)$/.test(pattern)) {
    if (/^\*\.[^\.\/]*$/.test(pattern)) {
        pattern = '**/' + pattern;
    }
    let regex = minimatch.makeRe(pattern);

    return new RegExp(regex.source, regex.ignoreCase ? 'i' : '');
};

/**
 * 删除指定文件或者某一个目录下的所有文件, 针对编译生成的文件.
 * @param {string} fpath
 */
const deleteFile = exports.deleteFile = function(fpath) {
    if (fpath && exists(fpath)) {
        let stat = fs.lstatSync(fpath);

        if (stat.isDirectory()) {
            fs.readdirSync(fpath).forEach(name => {
                if (name !== '.' && name !== '..') {
                    fs.unlinkSync(fpath + '/' + name);
                }
            });
            fs.rmdirSync(fpath);
            soi.log.fine(`delete directory [${fpath}]: success`);
        } else if (stat.isFile()) {
            fs.unlinkSync(fpath);
            soi.log.fine(`delete file [${fpath}]: success`);
        } else {
            soi.log.error(`unable to delete [${fpath}]: No such file or directory`);
        }
    } else {
        soi.log.error(`unable to delete [${fpath}]: No such file or directory`);
    }
};

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {string} url
 * @returns {boolean}
 */
const isAbsUrl = exports.isAbsUrl = function(url) {
    return /:\//.test(url);
};

/**
 * 测试路径是否目录
 * @param   {string} path
 * @returns {boolean}
 */
const isDirPath = exports.isDirPath = function(path) {
    return /\/|\\\\$/.test(path);
};

/**
 * 对象枚举元素遍历
 * @param {object}   obj      源对象
 * @param {function|object} callback 回调函数|目标对象
 * @param {boolean}   merge    是否为对象赋值模式
 * @function
 */
const map = exports.map = function(obj, callback, merge) {
    let index = 0;
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
const parseUrl = exports.parseUrl = function(url, opt) {
    opt = opt || {};
    url = node_url.parse(url);
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
exports.upload = function(url, data, content, filename, callback) {
    if (typeof content === 'string') {
        content = new Buffer(content, 'utf8');
    } else if (!(content instanceof Buffer)) {
        soi.log.error('unable to upload content [' + (typeof content) + ']');
    }

    let endl = '\r\n';
    let boundary  = '-----np' + Math.random();
    let collect = [];

    map(data, function(key, value) {
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

    let length = 0;
    collect.forEach(function(ele) {
        length += ele.length;
    });
    let opt = parseUrl(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data; boundary=' + boundary,
            'Content-Length': length
        }
    });
    let http = require('http');
    let req = http.request(opt, function(res) {
        let status = res.statusCode;
        let body = '';
        res.on('data', function(chunk) {
            body += chunk;
        }).on('end', function() {
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
 * 异步写文件
 * @param {string} fpath 写入路径
 * @param {string|Buffer} content 文件内容
 * @param {?object} options
 * @param {function} callback 回调函数
 */
exports.writeFile = function(fpath, content, options, callback) {
    let dir = path.parse(fpath).dir;
    if (!exists(fpath) && dir) {
        mkdir(dir);
    }

    options = options || {};
    options.mode = 511 & (~process.umask());

    //console.log(mode);
    fs.writeFile(fpath, content, options, err => {
        if (err) {
            return callback(err);
        }
        callback(null, 'Saved: ' + fpath);
    });
};

/**
 * 合并两个对象
 * @param {!object}   target 需要合并到的对象
 * @param {...object} src 待合并对象
 * @returns {!object}
 */
const merge = exports.merge = function(target, src) {
    function mer(target, obj) {
        if (isObject(obj)) {
            Object.keys(obj).forEach(key => {
                if (isObject(obj[key])) {
                    target[key] = merge(target[key] || {}, obj[key]);
                } else if (Array.isArray(obj[key])) {
                    target[key] = merge(target[key] || [], obj[key]);
                } else {
                    target[key] = obj[key];
                }
            });
        } else if (Array.isArray(obj)) {
            obj.forEach((item, i) => {
                if (isObject(item)) {
                    target[i] = target[i] || {};
                    target[i] = merge(target[i], item);
                } else if (Array.isArray(item)) {
                    target[i] = target[i] || [];
                    target[i] = merge(target[i], item);
                } else {
                    target[i] = src[i];
                }
            });
        } else {
            target = src;
        }
    }

    let objects = Array.prototype.slice.call(arguments, 1);
    objects.forEach(obj => {
        mer(target, obj);
    });

    return target;
};

/**
 * Seal methods
 * @param {!object} obj
 * @param {!Array} props
 */
exports.seal = function(obj, props) {
    props.forEach(prop => {
        Object.defineProperty(obj, prop, {
            writable: false,
            enumerable: true,
            value: obj[prop]
        });
    });
};

/**
 * Put the domain and path together, make it as a standard url format.
 * @param {string} domain
 * @param {string} to
 */
exports.normalizeUrl = function(domain, to) {
    var obj = node_url.parse(domain);
    obj.pathname = node_path.normalize(node_path.join(obj.pathname, to));
    return node_url.format(obj);
};

/**
 * 资源表保留 id type uri deps（如果有的话）
 * @param  {ResourceMap} resourceMap
 * @return {string}
 */
const shimMap = exports.shimMap = function(resourceMap) {
    let m = {
        root: resourceMap.root,
        resource: {},
        paths: {},
        cssClassMap: {}
    };

    let packages = {};

    // add js and css dependency graph
    map(resourceMap.resourceMap, (type, obj) => {
        // only specific resource types
        let types = soi.config.get('types');
        if (types.indexOf(type) < 0) {
            return;
        }

        m.resource[type] = {};
        map(obj, (key, item) => {
            m.resource[type][item.id] = {
                uri: item.uri,
                type: item.type,
                path: item.path,
                localPathName: item.localPathName,
                version: item.version || 'v0.1'
            };

            m.paths[item.path] = item.id;

            // 为资源保留异步加载
            if (item.type === 'js' && item.isNonblocking) {
                m.resource[type][item.id].async = true;
            }

            // 记录资源所属的合并文件
            if (item.within) {
                m.resource[type][item.id].within = item.within;
            }

            // 记录资源依赖的css文件
            if (item.requiredCSS && item.requiredCSS.length) {
                m.resource[type][item.id].css = item.requiredCSS;
            }

            // 记录资源依赖的js文件
            if (item.requiredModules && item.requiredModules.length) {
                m.resource[type][item.id].deps = item.requiredModules;
            }

            // 记录资源依赖的异步资源
            let asyncRequired = item.requiredAsyncModules;
            if (asyncRequired && asyncRequired.length) {
                m.resource[type][item.id].asyncLoaded = asyncRequired;
            }

        });
    });

    // add cssClassNameMap
    map(resourceMap.cssClassMap, (obf, origin) => {
        m.cssClassMap[obf] = origin;
    });

    // add package information
    Object.keys(resourceMap.pkgs).forEach(pkgId => {
        packages[pkgId] = resourceMap.pkgs[pkgId];
        delete packages[pkgId]._fileContent;
    });

    return {
        resources: m,
        packages: packages
    };
};

// default dist directory
exports.Default_Res_Dist = '/static/res/';