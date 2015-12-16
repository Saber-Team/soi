/**
 * @file Task基类
 *  todo 看是否需要优化删减
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var path = require('path');

var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');

/**
 * Task
 * @param {String}      name
 * @param {?Object}     options
 * @param {?Object}     soiOptions
 * @param {?Object}     args
 * @param {ResourceMap} map
 * @constructor
 */
function Task(name, options, soiOptions, args, map) {
  this.name = name;
  this.rules = new RuleMap();
  this.plugins = new PluginMap();
  this.options = options;
  this.args = args; //命令行相关参数
  this.soiOptions = soiOptions;
  this.map = map;
}
inherits(Task, EventEmitter);

/**
 * 设置命令行相关参数
 * @param params
 * @returns {Task}
 */
Task.prototype.setArgs = function (type, params) {
  this.args = params;
  this.type = type;
  return this;
};

/**
 * 设置map 资源表相关
 * @param params
 * @returns {Task}
 */
Task.prototype.setMap = function (map) {
  this.map = map;
  return this;
};

/**
 * 合并soi共用规则和当前task的规则
 */
Task.prototype.mergeRule = function() {
  this.rules.merge(soi.rules);
};

/**
 * 编译处理前触发
 * @param {Function} callback
 */
Task.prototype.beforeCompile = function(callback) {
  this.beforeCompileInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.beforeCompileInternal = function() {};

/**
 * I. 将js文件中的require相对路径替换成resource ID
 * II.函数做以下事情:
 *   1. 根据匹配规则解析出图像的线上uri
 *   2. 替换样式表中的图像路径
 *   3. 根据匹配规则计算样式表的线上uri
 *   4. 根据匹配规则和依赖树计算js的线上uri
 * @param {Function} callback
 */
Task.prototype.compile = function(callback) {
  this.resolveRelativeUrlInternal();
  this.resolveProductUriInternal();
  callback.call(this);
};

/**
 * 更新图片的线上uri, 根据匹配规则最后一条的to来替换
 */
Task.prototype.resolveImgRelativeUri = function () {
  var _this = this;
  var imgResources = Object.keys(this.map.resourceMap.Image);
  imgResources.forEach(function (imgPath) {
    var result = _this.rules.match(imgPath);
    var name = path.parse(imgPath).base;
    if (result.length) {
      _this.map.resourceMap.Image[imgPath].uri = result[result.length - 1]['to'] + '/' + name;
    }
  });
};

/**
 * 更新CSS的uri并且替换css中图片的地址为线上地址
 */
Task.prototype.resolveCssRelativeUri = function () {
  var _this = this;
  var cssResources = Object.keys(this.map.resourceMap.CSS);
  cssResources.forEach(function(cssPath) {
    var result = _this.rules.match(cssPath);
    var name = path.parse(cssPath).base;
    if (result.length) {
      _this.map.resourceMap.CSS[cssPath].uri = result[result.length - 1]['to'] + '/' + name;
    }
    // 替换css中的图片的地址为图片线上地址,
    _this.map.resourceMap.CSS[cssPath]._fileContent.replace(/url\s*\(\s*(['"]?)([^"'\)]*)\1\s*\)/gi, function(match) {
      var dirName = path.parse(cssPath).dir, url;

      match = match.replace(/\s/g, '');
      url = match.slice(4, -1).replace(/"|'/g, '').replace(/\\/g, '/');
      // 如果使用的线上图片,或者base64时不替换,否则替换为线上地址
      if (/^\/|https:|http:|data:/i.test(url) === false) {
        // 获取相关工程目录的地址
        url = soi.util.normalizeSysPath(path.resolve(dirName, url));
        // 获取线上地址
        url = _this.map.resourceMap.Image[url].uri;
      }
      return 'url("' + url + '")';
    });
  });
};

/**
 * 更新JS的uri并且替换js中require的路径为资源ID
 */
Task.prototype.resolveJsRelativeUri = function () {
  var _this = this;
  var jsResource = Object.keys(this.map.resourceMap.JS);
  var requireJsReg = /\brequire\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g;
  var requireAsycJsReg = /\brequire\s*\.async\(\s*["']([^'"\s]+)["'][^\)]*\)/g;
  jsResource.forEach(function(jsPath) {
    var result = _this.rules.match(jsPath);
    var name = path.parse(jsPath).base;
    if (result.length) {
      _this.map.resourceMap.JS[jsPath].uri = result[result.length - 1]['to'] + '/' + name;
    }
    // 如果需要模块化则添加wrapper
    if (_this.map.resourceMap.JS[jsPath].isModule) {
      _this.addJsWrapper(_this.map.resourceMap.JS[jsPath]);
    }

    _this.map.resourceMap.JS[jsPath]._fileContent
        .replace(requireJsReg,
            function(match, $1, $2) {
              // $2 就是匹配出来的依赖路径
              var dirName = path.parse(jsPath).dir, url;
              match = match.replace(/\s/g, '');
              url =  soi.util.normalizeSysPath(path.resolve(dirName, $2));
              // 获取js的resource ID
              url = _this.map.resourceMap.JS[url].id;
              return match.replace($2, url);
            }
        )
        .replace(requireAsycJsReg,
            function(match, dep) {
              // dep 是依赖数组
              var dirName = path.parse(jsPath).dir, url;
              match = match.replace(/\s/g, '');
              url =  soi.util.normalizeSysPath(path.resolve(dirName, dep));
              // 获取js的resource ID
              url = _this.map.resourceMap.JS[url].id;
              return match.replace(dep, url);
            }
        );
  });
};

/**
 * 给JS文件条件wrapper
 * @param jsObj
 */
Task.prototype.addJsWrapper = function (jsObj) {
  jsObj._fileContent = jsObj._fileContent.replace(/\/\*([\s\S]*?)\*\//m, function(match) {
    console.log(match);
    return match + '\n\n' + 'define(){';
  }) + '}';
};
/**
 * @override
 */
Task.prototype.resolveRelativeUrlInternal = function() {
  this.resolveImgRelativeUri();
  this.resolveCssRelativeUri();
  this.resolveJsRelativeUri();
};

/**
 * @override
 */
Task.prototype.resolveProductUriInternal = function() {};

/**
 * @param {Function} callback
 */
Task.prototype.postProcess = function(callback) {
  this.postProcessInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.postProcessInternal = function() {};

/**
 * 为资源表瘦身
 * @param {Function} callback
 */
Task.prototype.shim = function(callback) {
  this.shimInternal();
  callback.call(this);
};

/**
 * @override
 */
Task.prototype.shimInternal = function() {};

/**
 * 将文件写入
 * @param {Function} callback
 */
Task.prototype.flush = function(callback) {
  this.flushInternal();
  callback.call(this);
};

Task.prototype.deploy = function() {
  var that = this;
  var url = this.options.receiver;
  soi.util.map(this.map.resourcePathMap, function(key, item, idx) {
    var distPath = path.join(that.options.dir, item.path);
    soi.log.info('Sending: [' + item.path + '] ===> [' + distPath + ']');
    soi.util.upload(url, {to: distPath}, item._fileContent, path.basename(item.path), function(err, msg) {
      if (err) {
        soi.log.error('upload error: [' + err + ']');
        return ;
      }
      soi.log.ok('upload success: [' + msg + ']');
    });
  });
};

/**
 * @override
 */
Task.prototype.flushInternal = function() {
  if (this.type === 'deploy') {
    this.deploy();
  }
};

/**
 * 应用插件
 */
Task.prototype.apply = function() {
  this.plugins.apply(this);
  return this;
};

//===============================================
// 以下为公共API
//===============================================

/**
 * 添加规则
 * @param {String|RegExp} pattern
 * @param {?Object} options
 */
Task.prototype.addRule = function(pattern, options) {
  this.rules.add(pattern, options);
  return this;
};

/**
 * 记录要使用的服务插件
 * @param {String} plug
 * @param {?Object} options
 * @return {Task}
 */
Task.prototype.use = function(plug, options) {
  this.plugins.add(plug, options);
  return this;
};

/**
 * 执行
 */
Task.prototype.run = function() {
  this.mergeRule();
  this.apply();
  this.emit('beforeStart', this);
  this.beforeCompile(function() {
    this.emit('compile', this);
    //debugger;
    this.compile(function() {
      this.emit('compiled', this);
      //debugger;
      this.postProcess(function() {
        this.emit('postProcessed', this);
        this.shim(function() {
          this.emit('shim', this);
          this.flush(function() {
            this.emit('flushed', this);
            this.emit('complete', this);
          });
        });
      });
    });
  });
};

module.exports = Task;