/**
 * @file Task基类
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var path = require('path');

var PluginMap = require('./PluginMap');
var RuleMap = require('./RuleMap');

var RE_IMG_URL = /url\s*\(\s*(['"]?)([^"'\)]*)\1\s*\)/gi;
var RE_URL = /(?:\s*)url\((?:(?:"|')?)(?:\s*)([^\)"']*)(?:\s*)(?:(?:"|')?)\)(?:\s*)/;
var requireJsReg = /\brequire\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g;
var requireAsyncJsReg = /\brequire\s*\.async\(\s*["']([^'"\s]+)["'][^\)]*\)/g;

/**
 * 冻结方法
 * @param {object} obj
 * @param {Array} props
 */
function seal(obj, props) {
  props.forEach(function(prop) {
    Object.defineProperty(obj, prop, {
      writable: false,
      enumerable: true,
      value: obj[prop]
    });
  });
}

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {string} url
 * @returns {boolean}
 */
function isAbsUrl(url) {
  return /:\//.test(url);
}

/**
 * 给模块代码加入cmd wrapper
 * @param {JSResource} jsResource
 * @param {object} options
 */
function cmdWrapper(jsResource, options) {
  /*
   jsResource.getContent().replace(/\/\*([\s\S]*?)\*\//m, function(match) {
   console.log(match);
   return match + '\n\n' + 'define(){';
   }) + '})';
   */
  var content =
      options.commentdoc + '\n' +
      options.define + '("' + jsResource.id + '", function(require, exports, module) {\n' +
      (options.usestrict ? '"use strict";' : '') +
      jsResource.getContent() + '\n});';

  jsResource.setContent(content);
}

/**
 * Task
 * @param {string}      name
 * @param {?object}     options
 * @param {?object}     soiOptions
 * @param {?object}     args
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

  seal(this, [
    'addRule', 'use', 'run', 'setArgs', 'setMap', '_apply', 'config', '_mergeRule',
    'beforeCompile', 'compile', '_compileImage', '_compileCSS', '_compileJS',
    'pack', 'postProcess', 'shim', 'flush'
  ]);
}

inherits(Task, EventEmitter);

/**
 * 合并soi共用规则和当前task的规则
 */
Task.prototype._mergeRule = function() {
  this.rules.merge(soi.rules);
};

/**
 * 编译图片资源
 * @param {ImageResource} resource
 */
Task.prototype._compileImage = function(resource) {
  // 暂时不需要做什么额外的操作
  this.emit('compile-resource', resource);
  this.resolveProductUriInternal(resource);
  resource.isCompiled = true;
};

/**
 * 编译css资源
 * @param {CssResource} resource
 */
Task.prototype._compileCSS = function(resource) {
  var task = this;
  // 替换css中的资源, 递归编译
  resource.getContent()
      .replace(RE_URL, function($0, $1) {
        if (isAbsUrl($1)) {
          return $1;
        }

        var uri = path.resolve(resource.path, $1);

        var inlineResource = task.map.getResourceByPath(uri);
        // 若图片未编译
        if (inlineResource && !inlineResource.isCompiled) {
          task._compileImage(inlineResource);
          return inlineResource.uri;
        }
        // todo warning
        return $1;
      });

  this.emit('compile-resource', resource);
  this.resolveProductUriInternal(resource);
  resource.isCompiled = true;
};

/**
 * 编译js资源
 * @param {JSResource} resource
 */
Task.prototype._compileJS = function(resource) {
  var task = this;

  resource.getContent()
      .replace(requireJsReg, function(match, $1, $2) {
        // $2 就是匹配出来的依赖路径
        var dirName = path.parse(resource.path).dir, url;
        match = match.replace(/\s/g, '');
        url =  soi.util.normalizeSysPath(path.resolve(dirName, $2));
        var inlineResource = task.map.resourcePathMap[url];
        if (inlineResource && !inlineResource.isCompiled) {
          task._compileJS(inlineResource);
        }

        return match.replace($2, inlineResource.id);
      })
      .replace(requireAsyncJsReg, function(match, dep) {
        // todo dep 是依赖数组
        var dirName = path.parse(resource.path).dir, url;
        match = match.replace(/\s/g, '');
        url =  soi.util.normalizeSysPath(path.resolve(dirName, dep));
        var inlineResource = task.map.resourcePathMap[url];
        if (inlineResource && !inlineResource.isCompiled) {
          task._compileJS(inlineResource);
        }

        return match.replace(dep, inlineResource.id);
      });

  if (resource.isModule) {
    cmdWrapper(resource, task.config.get('cmdWrapper'));
  }

  this.emit('compile-resource', resource);
  this.resolveProductUriInternal(resource);
  resource.isCompiled = true;
};

/**
 * 应用插件
 */
Task.prototype._apply = function() {
  this.plugins._apply(this);
  return this;
};


//===============================================
// 以下为公共API, 不可改变
//===============================================
/**
 * 设置命令行相关参数
 * @param {object} params
 * @returns {Task}
 */
Task.prototype.setArgs = function (params) {
  this.args = params;
  return this;
};

/**
 * 设置map资源表相关
 * @param {ResourceMap} map
 * @returns {Task}
 */
Task.prototype.setMap = function (map) {
  this.map = map;
  return this;
};

/**
 * 获取map资源表相关
 * @returns {ResourceMap} map
 */
Task.prototype.getMap = function () {
  return this.map;
};

/**
 * 添加规则
 * @param {string|RegExp} pattern
 * @param {?object} options
 */
Task.prototype.addRule = function(pattern, options) {
  this.rules.add(pattern, options);
  return this;
};

/**
 * 记录要使用的服务插件
 * @param {string} plug
 * @param {?object} options
 * @return {Task}
 */
Task.prototype.use = function (plug, options) {
  this.plugins.add(plug, options);
  return this;
};

/**
 * 执行
 */
Task.prototype.run = function() {
  this._mergeRule();
  this._apply();
  this.emit('beforeCompile', this);
  this.beforeCompile(function() {
    this.emit('compile', this);
    // 编译
    this.compile(function() {
      this.emit('compiled', this);
      this.emit('pack', this);
      // 合并打包
      this.pack(function() {
        this.emit('packed', this);
        // 后处理
        this.postProcess(function() {
          this.emit('postProcessed', this);
          // 简化资源表
          this.shim(function() {
            this.emit('shimed', this);
            // 写文件
            this.flush(function() {
              this.emit('flushed', this);
              this.emit('complete', this);
            });
          });
        });
      });
    });
  });
};

/**
 * 编译处理前触发
 * @param {function} callback
 */
Task.prototype.beforeCompile = function(callback) {
  var task = this;
  task.beforeCompileInternal();
  process.nextTick(callback.bind(task));
};

/**
 * 资源纬度递归编译
 * @param {function} callback
 */
Task.prototype.compile = function(callback) {
  var task = this;
  var map = task.getMap();
  // 遍历资源表
  map.resourceCache.forEach(function(resource) {
    switch (resource.type) {
      case 'Image':
        task._compileImage(resource);
        break;
      case 'CSS':
        task._compileCSS(resource);
        break;
      case 'JS':
        task._compileJS(resource);
        break;
      default:
        // todo warning
        break;
    }
  });
  process.nextTick(callback.bind(task));
};

/**
 * 合并文件
 * @param {function} callback
 */
Task.prototype.pack = function(callback) {
  var task = this;
  process.nextTick(callback.bind(task));
};

/**
 * 编译后处理
 * @param {function} callback
 */
Task.prototype.postProcess = function(callback) {
  var task = this;
  task.postProcessInternal();
  process.nextTick(callback.bind(task));
};

/**
 * 为资源表瘦身
 * @param {function} callback
 */
Task.prototype.shim = function(callback) {
  var task = this;
  task.shimInternal();
  process.nextTick(callback.bind(task));
};

/**
 * 将文件写入
 * @param {function} callback
 */
Task.prototype.flush = function(callback) {
  var task = this;
  task.flushInternal();
  process.nextTick(callback.bind(task));
};


//===============================================
// 以下为插件扩展点API, 插件可选择覆盖的方法
//===============================================
Task.prototype.beforeCompileInternal = function() {};
Task.prototype.resolveProductUriInternal = function(resource) {
  // 更新线上uri, 根据匹配规则最后一条的to来替换
  var result = this.rules.match(resource.path);
  var name = path.parse(resource.path).base;
  if (result.length) {
    resource.uri = result[result.length - 1]['to'] + path.sep + name;
  }
};
Task.prototype.postProcessInternal = function() {};
Task.prototype.shimInternal = function() {};
Task.prototype.flushInternal = function() {};


module.exports = Task;