/**
 * Author:  AceMood
 * Email:   zmike86@gmail.com
 * Version: 0.2.2
 */

/**
 * ==================================================================
 * browser code in development
 *
 * The Asynchronous Module Definition (AMD) API specifies a mechanism
 * for defining modules such that the module and its dependencies can
 * be asynchronously loaded. This is particularly well suited for the
 * browser environment where synchronous loading of modules incurs
 * performance, usability, debugging, and cross-domain access problems.
 *
 * ==================================================================
 * compiled for production in browser
 *
 *
 * See for more:
 * "https://github.com/amdjs/amdjs-api/wiki/AMD"
 *
 */

(function (global, undefined) {

  'use strict';

  var OP = Object.prototype,
      AP = Array.prototype,
      native_forEach = AP.forEach,
      native_map = AP.map,
      hasOwn = OP.hasOwnProperty,
      toString = OP.toString;


// use such an object to determine cut down a forEach loop;
  var break_obj = {};


  /** 空函数作为默认回调函数 */
  function noop() {}


  /**
   * iterate the array and map the value to a delegation
   * function, use the return value replace original item.
   * @param {Array} arr array to be iterated.
   * @param {Function} fn callback to execute on each item
   * @param {Object?} opt_context fn's context
   * @return {!Array}
   */
  function map(arr, fn, opt_context) {
    var ret = [];
    if (native_map && arr.map === native_map) {
      ret = arr.map(fn, opt_context);
    } else if (arr.length === +arr.length) {
      for (var i = 0; i < arr.length; ++i) {
        ret.push(fn.call(opt_context || null, arr[i], i, arr));
      }
    }
    return ret;
  }


  /**
   * NOTE:
   * The forEach function is intentionally generic;
   * it does not require that its this value be an Array object.
   * Therefore it can be transferred to other kinds of objects
   * for use as a method. Whether the forEach function can be applied
   * successfully to a host object is implementation-dependent.
   *
   * @param {Array} arr array to be iterated.
   * @param {Function} fn callback to execute on each item
   * @param {Object?} opt_context fn's context
   */
  function forEach(arr, fn, opt_context) {
    if (native_forEach && arr.forEach === native_forEach) {
      arr.forEach(fn, opt_context);
    } else if (arr.length === +arr.length) {
      for (var i = 0, length = arr.length; i < length; i++) {
        if (fn.call(opt_context, arr[i], i, arr) === break_obj) {
          break;
        }
      }
    }
  }


  /**
   * 正向寻找指定项在数组的位置;
   * @param {Array} arr
   * @param {*} tar
   * @return {Number}
   */
  function indexOf(arr, tar) {
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === tar) {
        return i;
      }
    }
    return -1;
  }


  /**
   * 类型映射
   * @type {Object}
   */
  var typeMap = {
    '[object Object]'   : 'object',
    '[object Array]'    : 'array',
    '[object Function]' : 'function',
    '[object RegExp]'   : 'regexp',
    '[object String]'   : 'string',
    '[object Number]'   : 'number'
  };


  /**
   * 判断对象类型, 见typeMap
   */
  function typeOf(obj) {
    return typeMap[toString.call(obj)];
  }


  /**
   * 判断是否为undefined或者null
   * @param {*} obj
   * @return {boolean}
   */
  function isNull(obj) {
    return obj === void 0 || obj === null;
  }

  var doc = document,
      head = doc.head || doc.getElementsByTagName('head')[0],
  // IE6下的经典bug, 有base元素的情况下head.appendChild容易出错in jQuery.
  // 详见: 'http://dev.jquery.com/ticket/2709'
      $base = doc.getElementsByTagName('base')[0];

  if ($base) {
    head = $base.parentNode;
  }

// current adding script node
  var currentAddingScript,
// 老版本Firefox不支持script.readyState, so we only use this prop
// in IEs. Although 'onload' in IE9 & IE10 have problems, but I do not
// care the issure, and whatever async is true or false. We just
// remove node in document as the callback of javascript loaded.
// Read more about the bug:
// 'https://connect.microsoft.com/IE/feedback/details/729164/'
// + 'ie10-dynamic-script-element-fires-loaded-readystate-prematurely'
// 'https://connect.microsoft.com/IE/feedback/details/648057/'
// + 'script-onload-event-is-not-fired-immediately-after-script-execution'
      useInteractive = ('readyState' in doc.createElement('script')),
// loop all script nodes in doc, if one's readyState is 'interactive'
// means it's now executing;
      interactiveScript;


  /**
   * 动态script插入获取模块.
   * @param {String} url 文件路径.
   * @param {String} name Original name to require this module.
   *   maybe a top-level name, relative name or absolute name.
   */
  function fetch(url, name) {
    var script = doc.createElement('script');
    script.charset = 'utf-8';
    script.async = true;
    // custom attribute to remember the original required name
    // which written in dependant module.
    script.kernel_name = name;

    // Event binding
    script.onreadystatechange = script.onload = script.onerror = function() {
      script.onreadystatschange = script.onload = script.onerror = null;
      interactiveScript = null;
      if (!script.readyState || /complete/.test(script.readyState)) {
        head.removeChild(script);
      }
    };

    // Older IEs will request the js file once src has been set,
    // then readyState will be "loaded" if script complete loading,
    // but change to "complete" after the code executed.
    script.src = url;
    currentAddingScript = script;
    if ($base) {
      head.insertBefore(script, $base);
    } else {
      head.appendChild(script);
    }
    currentAddingScript = null;
  }


  /**
   * 获取当前页面中所有script节点
   * @return {NodeList}
   */
  function scripts() {
    return doc.getElementsByTagName('script');
  }


  /**
   * get current executing script
   * @return {*}
   */
  function getCurrentScript() {
    // In chrome and FF and Opera, use Error.prototype.stack
    // It's important to note that this will not reference the <script> element
    // if the code in the script is being called as a callback or event handler;
    // it will only reference the element while it's initially being processed.
    // Read more:
    //   'https://developer.mozilla.org/en-US/docs/Web/API/document.currentScript'
    return doc.currentScript || currentAddingScript || (function() {
      var _scripts;
      if (useInteractive) {
        if (interactiveScript &&
            interactiveScript.readyState === "interactive") {
          return interactiveScript;
        }

        _scripts = scripts();
        forEach(_scripts, function(script) {
          if (script.readyState === "interactive") {
            interactiveScript = script;
            return break_obj;
          }
        });
        return interactiveScript;
      }
      // todo in FF early version
      // return null;
    })() || (function() {
      var ret = null;
      var stack;
      try {
        throw new Error();
      } catch(e) {
        stack = e.stack;
      }

      if (!stack) {
        return ret;
      }

      /**
       * chrome uses at, FF uses @
       * Also consider IE 11.
       * FireFox: e.g.
       * getCurrentScript/<@file:///D:/Develop/SOI/lib/kernel.js:261:15
       * getCurrentScript@file:///D:/Develop/SOI/lib/kernel.js:257:1
       * getCurrentPath@file:///D:/Develop/SOI/lib/kernel.js:314:16
       * require@file:///D:/Develop/SOI/lib/kernel.js:563:29
       * require.async@file:///D:/Develop/SOI/lib/kernel.js:1178:5
       * bind/<@file:///D:/Develop/SOI/demo/assets/js/app.js:25:9
       * F@file:///D:/Develop/SOI/demo/lib/events/util.js:2:4216
       * q@file:///D:/Develop/SOI/demo/lib/events/util.js:2:1034
       * y/a<@file:///D:/Develop/SOI/demo/lib/events/util.js:2:2610
       *
       * chrome 39.0 e.g.
       * at file:///D:/lib/kernel.js:261:15
       * at getCurrentScript (file:///D:/lib/kernel.js:294:7)
       * at getCurrentPath (file:///D:/lib/kernel.js:314:16)
       * at require (file:///D:/lib/kernel.js:563:29)
       * at Function.require.async (file:///D:/lib/kernel.js:1178:5)
       * at HTMLButtonElement.<anonymous> (file:///D:/assets/js/app.js:25:17)
       * at F (file:///D:/lib/events/util.js:2:4218)
       * at q (file:///D:/lib/events/util.js:2:1034)
       * at HTMLButtonElement.<anonymous> (file:///D:/lib/events/util.js:2:2610)"
       *
       * IE11 e.g.
       * at Anonymous function (file:///D:/Develop/SOI/lib/kernel.js:294:7)
       * at getCurrentPath (file:///D:/Develop/SOI/lib/kernel.js:314:16)
       * at Global code (file:///D:/Develop/SOI/lib/kernel.js:563:29)
       */
      var e = stack.indexOf(" at ") !== -1 ? " at " : "@";
      var index = stack.indexOf(".async");
      if (index > -1) {
        stack = stack.substring(index + 7);
        stack = stack.split(e)[1];
        stack = stack.replace(/^([^\(]*\()/, '');
      } else {
        while (stack.indexOf(e) !== -1) {
          stack = stack.substring(stack.indexOf(e) + e.length);
        }
      }

      stack = stack.substring(0, stack.indexOf(".js") + 3);
      // for ie11
      stack = stack.replace(/^([^\(]*\()/, "");

      var _scripts = scripts();
      forEach(_scripts, function(script) {
        var path = getAbsPathOfScript(script);
        if (path === stack) {
          ret = script;
          return break_obj;
        }
      });
      return ret;
    })();
  }


  /**
   * 跨浏览器解决方案获得script节点的src绝对路径.
   * @param {HTMLScriptElement} script
   * @return {String}
   */
  function getAbsPathOfScript(script) {
    return script.hasAttribute ? script.src : script.getAttribute('src', 4);
  }


  /**
   * 获取当前执行js代码块的绝对路径. node为空则返回null
   * @return {?String}
   */
  function getCurrentPath() {
    var node = getCurrentScript();
    return node ? getAbsPathOfScript(node) : null;
  }

// and a directory file path must be ends with a slash (back slash in window)
  var dirRegExp = /\/$/g,
// whether a path to a file with extension
      fileExtRegExp = /\.(js|css|tpl|txt)$/g;


// retrieve current doc's absolute path
// It may be a file system path, http path
// or other protocol path
  var loc = global.location;


  /**
   * Normalize a string path, taking care of '..' and '.' parts.
   * This method perform identically with node path.normalize.
   *
   * When multiple slashes are found, they're replaced by a single one;
   * when the path contains a trailing slash, it is preserved.
   * On Windows backslashes are used in FileSystem.
   *
   * Example:
   * path.normalize('/foo/bar//baz/asdf/quux/..')
   * returns '/foo/bar/baz/asdf'
   *
   * @param {string} p
   */
  function normalize(p) {
    // step1: combine multi slashes
    p = p.replace(/(\/)+/g, "/");

    // step2: resolve '.' and '..'
    p = resolveDot(p);
    return p;
  }


  /**
   * resolve a path with a '.' or '..' part in it.
   * @param {string} p
   * @return {string}
   */
  function resolveDot(p) {
    // Here I used to use /\//ig to split string, but unfortunately
    // it has serious bug in IE<9. See for more:
    // 'http://blog.stevenlevithan.com/archives/cross-browser-split'.
    p = p.split("/");
    for (var i = 0; i < p.length; ++i) {
      if (p[i] === ".") {
        p.splice(i, 1);
        --i;
      } else if (p[i] === ".." && i > 0 && p[i - 1] !== "..") {
        p.splice(i - 1, 2);
        i -= 2;
      }
    }
    return p.join("/");
  }


  /**
   * To get current doc's directory
   * @return {string}
   */
  function getPageDir() {
    return dirname(loc.href);
  }


  /**
   * Judge if a path is top-level, such as 'core/class.js'
   * @param {string} p Path to check.
   * @return {boolean} b
   */
  function isTopLevel(p) {
    // if we use array-like as string[index] will return undefined
    // in IE6 & 7, so we should use string.charAt(index) instead.
    // see more:
    // 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
    // +Global_Objects/String#section_5'
    return isRelative(p) && p.charAt(0) !== ".";
  }


  /**
   * Return if a path is absolute.
   * In most web environment, absolute url starts with a 'http://' or 'https://';
   * In Windows File System, starts with a 'file:///' protocol;
   * In UNIX like System, starts with a single '/';
   *
   * @param {string} p Path to check.
   * @return {boolean} b Is p absolute?
   */
  function isAbsolute(p) {
    return /:\/\//.test(p) || /^\//.test(p);
  }


  /**
   * Return if a path is relative.
   * In most web environment, relative path start with a single/double dot.
   * e.g: ../a/b/c; ./a/b
   *
   * Here we think topLevel path is a kind of relative path.
   *
   * @param {string} p Path to check.
   * @return {boolean} b
   */
  function isRelative(p) {
    return !isAbsolute(p) && (/^(\.){1,2}\//.test(p) || p.charAt(0) !== "/");
  }


  /**
   * Map the identifier for a module to a Internet file
   * path. SCRIPT insertion will set path with it, except
   * build-in names.
   *
   * @param {string} id Always the module's name or identifier.
   * @param {string?} base A relative baseuri for resolve the
   *   module's absolute file path.
   * @return {!(string|object)} exports object or absolute file path from Internet
   */
  function resolveId(id, base) {
    // var _mod = kerneljs.cache.mods[id];
    if (id === "require" ||
        id === "module" ||
        id === "exports" /*|| (_mod &&  _mod != empty_mod)*/) {
      return id;
    }

    if (isTopLevel(id)) {
      // step 1: normalize id and parse head part as paths
      id = parsePaths(id);
      // step 2: normalize id and parse head part as pkgs
      id = parsePackages(id);
      // here if a top-level path then relative base change to
      // current document's baseUri.
      base = null;
    }

    // step 3: add file extension if necessary
    id = normalize(id);
    var conjuction = id.charAt(0) === "/" ? "" : "/";
    var url = (base ? dirname(base) : getPageDir()) + conjuction + id;

    if (!fileExtRegExp.test(url)) {
      url += ".js";
    }

    url = resolveDot(url);

    return url;
  }


  /**
   * Return the directory name of a path. Similar to the
   * UNIX dirname command.
   *
   * Example:
   * path.dirname('/foo/bar/baz/asdf/quux')
   * returns '/foo/bar/baz/asdf'
   *
   * @param {string} p
   * @return {string}
   */
  function dirname(p) {
    if (dirRegExp.test(p)) {
      return p.slice(0, -1);
    }
    // Here I used to use /\//ig to split string, but unfortunately
    // it has serious bug in IE<9. See for more:
    // 'http://blog.stevenlevithan.com/archives/cross-browser-split'.
    p = p.split("/");
    p.pop();
    return p.join("/");
  }


  /**
   * Alias will appear at head part of path.
   * So replace it if exists in kerneljs.paths.
   * @param {String} p
   * @return {String} s
   */
  function parsePaths(p) {
    var ret = [];
    if (kerneljs.paths) {
      var part = p;
      var parts = p.split("/");
      while (!(part in kerneljs.paths) && parts.length) {
        ret.unshift(parts.pop());
        part = parts.join("/");
      }
      p = kerneljs.paths[part] ? kerneljs.paths[part] : part;
    }
    return p + ret.join("/");
  }


  /**
   * pkg name can also impact on path resolving.
   * After paths, we should find it in pkg configuration.
   * So replace it if exists in kerneljs.packages.
   * @param {String} p
   * @return {String} s
   */
  function parsePackages(p) {
    var pkgs = kerneljs.packages,
        fpath = "";
    if (pkgs && pkgs.length > 0) {
      forEach(pkgs, function(pkg) {
        // starts with a package name
        if (p.indexOf(pkg.name) === 0) {
          // absolutely equal
          if (p.length === pkg.name.length) {
            fpath = "/" + (pkg.main ? pkg.main : "main");
          }
          p = p.replace(pkg.name, pkg.location || pkg.name) + fpath;
          return break_obj;
        }
      });
    }
    return p;
  }

  /**
   * Module包装类.
   * # uid    自生成的uid标识唯一模块.
   * # id     用户自定义的模块名, 是可选的但如果我们不写id会使一些测试用例失败(see anon_circular case),
   *          于是对一些不必要的测试用例作了修改.
   * # url    模块对用的物理文件路径.
   * # deps   依赖模块的字面亮表示, 也是require|define源码的写法中依赖数组的值.
   *          (todo it also retrieve the requrie statements in function's
   *          string value in case that a CMD wrapper is used. 考虑去掉对cmd的支持)
   * # depMods依赖模块的表示对象数组.
   * # status 当前模块状态, 见 Module.STATUS.
   * # factory模块的导出函数, 通过工厂函数导出模块的表示值.
   * @constructor
   */
  function Module(obj) {
    this.uid = obj.uid;
    this.id = obj.id || null;
    this.url = obj.url;
    this.deps = obj.deps || [];
    this.depMods = new Array(this.deps.length);
    this.status = obj.status || Module.STATUS.init;
    this.factory = obj.factory || noop;
    this.exports = {}; // todo
  }


  /**
   * 模块的4种状态.
   * # init     模块刚被创建, 还没有获取自身的模块.
   * # loaded   只在<IE11出现, 表示自身模块已经下载完成.
   * # fetching 正在获取自身依赖模块但还没导出自身模块.
   * # complete 模块已被导出且缓存到模块池中.
   */
  Module.STATUS = {
    'init'      : 0,
    'loaded'    : 1,
    'fetching'  : 2,
    'complete'  : 3
  };


  /**
   * 设置模块状态
   * @param {Number} status
   */
  Module.prototype.setStatus = function(status) {
    if (status < 0 || status > 4) {
      throw 'Status ' + status + ' is now allowed.';
    } else {
      this.status = status;
      switch (status) {
        case 0:
          break;
        case 2:
          kerneljs.trigger(kerneljs.events.startFetch, [this]);
          break;
        case 3:
          kerneljs.trigger(kerneljs.events.complete, [this]);
          break;
      }
    }
  };


  /**
   * 当模块已被缓存<code>mod.status = Module.STATUS.complete</code>,
   * 则需要通知所有依赖于它的模块, 需要调用depandant.ready(mod);
   * @param {Module|Object} mod
   */
  Module.prototype.ready = function(mod) {
    var inPathConfig;
    if (mod.url) {
      if (kerneljs.paths && kerneljs.paths[this.id]) {
        inPathConfig = true;
      }
      for(var i = 0; i < this.deps.length; ++i) {
        var path = resolveId(this.deps[i], inPathConfig ? loc.href : this.url);
        if (path === mod.url) {
          this.depMods[i] = mod.exports;
          break;
        }
      }
    }
    if (this.checkAllDepsOK()) {
      notify(this);
    }
  };


  /**
   * 检查是否模块的依赖项都已complete的状态. note: 由于模块导出值也可能是字符串, 尤其是模板相关的模块,
   * 所以这里通过isNull函数检查.
   * @return {boolean}
   */
  Module.prototype.checkAllDepsOK = function() {
    var ok = true;
    // I do not use forEach here because native forEach will
    // bypass all undefined values, so it will introduce
    // some tricky results.
    for (var i = 0; i < this.depMods.length; ++i) {
      if (isNull(this.depMods[i])) {
        ok = false;
        break;
      }
    }
    return ok;
  };

  /**
   * TODO: 考虑去掉对CJSWrapper的支持, 很容易和CMD的做法混淆. 其实有使用差异, 毕竟AMD
   * TODO: 提倡的是预加载, 采用的方式是预执行, 而且浏览器端AMD更适合. 用CMD的方式就必须使用正则
   * TODO: 或者做一些语法分析解析出函数内部的require模块, 个人感觉这么做必要性不大.
   */


// A regexp to filter `require('xxx')`
  var cjsRequireRegExp = /\brequire\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g,
// A regexp to drop comments in source code
      commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;


// initialize a module
  var empty_mod = {
    id: null,
    uid: null,
    url: null,
    status: null,
    exports: {}
  };


// ID相同的错误消息
  var SAME_ID_MSG = 'more then one module defined with the same id: %s';


  /**
   * if a module with in the same id exists, then define with the id
   * will fail. we throw an error with useful message.
   */
  function exist_id_error(id) {
    throw SAME_ID_MSG.replace('%s', id);
  }


  /**
   * 全局define函数. 函数签名:
   * define(id?, dependencies?, factory);
   * 见: https://github.com/amdjs/amdjs-api/blob/master/AMD.md#define-function-
   * @param {String|Array|Function|Object} id
   * @param {Array|Function|Object} deps
   * @param {(Function|Object)?} factory
   */
  function define(id, deps, factory) {
    var mod, cache = kerneljs.cache,
        uid = kerneljs.uidprefix + kerneljs.uid++;

    // doc.currentScript在异步情况下比如事件处理器或者setTimeout返回错误结果.
    // 但如果不是这种情况且遵循每个文件一个define模块的话这个属性就能正常工作.
    var base = getCurrentPath();

    // 处理参数
    if (typeOf(id) !== 'string') {
      factory = deps;
      deps = id;
      id = null;
    }

    if (typeOf(deps) !== 'array') {
      factory = deps;
      deps = null;
    }

    // 只有当用户自定义的id存在时才会被缓存到id2path.
    if (id) {
      // 只在开发时报同一id错误
      // 打包时由于require.async的使用造成层级依赖模块的重复是有可能存在的, 并且S.O.I
      // 也没有很好解决. 当非首屏首页的多个模块又各自依赖或含有第三个非注册过的模块时, 这个
      // 模块会被打包进第二个和第三个package, 这样就有可能在运行时造成同一id多次注册的现象.
      if (cache.id2path[id] && kerneljs.debug) {
        kerneljs.trigger(kerneljs.events.ERROR, [
          SAME_ID_MSG.replace('%s', id),
          base
        ]);
        return exist_id_error(id);
      }
      cache.id2path[id] = base;
      cache.mods[id] = empty_mod;
    }

    // 缓存path2uid
    if (cache.path2uid[base]) {
      cache.path2uid[base].push(uid);
    } else {
      cache.path2uid[base] = [uid];
    }

    // 注册模块
    mod = cache.mods[uid] = empty_mod;

    // If no name, and factory is a function, then figure out if it a
    // CommonJS thing with dependencies. I don't intend to support it.
    // But many projects used RequireJS may depend on this functional.
    // Code below in the if-else statements lent from RequireJS
    if (!deps && typeOf(factory) === 'function') {
      deps = [];
      // Remove comments from the callback string,
      // look for require calls, and pull them into the dependencies,
      // but only if there are function args.
      if (factory.length) {
        factory
            .toString()
            .replace(commentRegExp, '')
            .replace(cjsRequireRegExp, function(match, quote, dep) {
              deps.push(dep);
            });

        // May be a CommonJS thing even without require calls, but still
        // could use exports, and module. Avoid doing exports and module
        // work though if it just needs require.
        // REQUIRES the function to expect the CommonJS variables in the
        // order listed below.
        deps = (factory.length === 1 ?
            ['require'] : ['require', 'exports', 'module']).concat(deps);
      }
    }

    // 创建模块
    mod = cache.mods[uid] = new Module({
      uid: uid,
      id: id,
      url: base,
      deps: deps,
      factory: factory,
      status: Module.STATUS.init
    });
    kerneljs.trigger(kerneljs.events.create, [mod]);

    // 打包过后define会先发生, 这种情况script标签不会带有kernel_name字段.
    var name = getCurrentScript().kernel_name;
    if (name && isTopLevel(name) && !mod.id) {
      mod.id = name;
    }

    // fill exports list to depMods
    if (mod.deps && mod.deps.length > 0) {
      mod.deps = map(mod.deps, function(dep, index) {
        if (dep === 'exports' || dep === 'module') {
          mod.cjsWrapper = true;
        }

        var inject = resolve(dep, mod);
        if (inject) {
          mod.depMods[index] = inject;
        }
        return dep;
      });
    }

    // 加载依赖模块
    load(mod);
  }


  /**
   * 加载依赖模块文件.
   * @param {Object|Module} mod 宿主模块.
   */
  function load(mod) {

    var cache = kerneljs.cache;
    var count = mod.deps.length;
    var inPathConfig = kerneljs.paths && kerneljs.paths[mod.id] ? true : false;
    // 若mod.id在paths中已经配置则相对路径是location.href,
    // 详见: config_path_relative test case.
    var currentPath = inPathConfig ? loc.href : getCurrentPath();

    // 更新fetchingList.
    fetchingList.add(mod);

    // Register module in global cache with an empty.
    // export for later checking if its status is available.
    if (!cache.mods[mod.uid]) {
      cache.mods[mod.uid] = empty_mod;
    }

    // 更新模块状态
    mod.setStatus(Module.STATUS.fetching);

    forEach(mod.deps, function(name, index) {
      // After resolving, built-in module and existed modules are
      // available. it's useful after static analyze and combo files
      // into one js file.
      // so check if an object first of all.
      if (mod.depMods[index]) {
        --count;
        return;
      }

      // else it's a real file path. get its responding uid
      var path = resolveId(name, currentPath);
      var uid = cache.path2uid[path];

      // File has been fetched, but its deps may not being fetched yet,
      // so its status is 'fetching' now.
      // we check circular reference first, if it there, we return the
      // empty_mod immediately.
      if (uid && cache.mods[uid[0]] &&
          (cache.mods[uid[0]].status === Module.STATUS.complete ||
              checkCycle(path, mod))) {
        --count;
        mod.depMods[index] = cache.mods[uid[0]].exports;

        // It's a user-defined or not been fetched file.
        // If it's a user-defined id and not config in global alias,
        // it will produce a 404 error.
      } else {
        // record this mod depend on the dep current now.
        if (!dependencyList[path]) {
          dependencyList[path] = [mod];
        } else if (indexOf(dependencyList[path], mod) < 0) {
          dependencyList[path].push(mod);
        }

        if (!sendingList[path]) {
          sendingList[path] = true;
          // script insertion
          fetch(path, name);
        }
      }
    });

    // If all module have been cached.
    // In notify, mod will be removed from fetchingList
    if (count === 0) {
      notify(mod);
    }
  }


  /**
   * define.amd property
   *
   * To allow a clear indicator that a global define function
   * (as needed for script src browser loading) conforms to the AMD API,
   * any global define function SHOULD have a property called "amd" whose
   * value is an object. This helps avoid conflict with any other existing
   * JavaScript code that could have defined a define() function that
   * does not conform to the AMD API.
   *
   * The properties inside the define.amd object are not specified at this time.
   * It can be used by implementers who want to inform of other capabilities
   * beyond the basic API that the implementation supports.
   *
   * Existence of the define.amd property with an object value indicates
   * conformance with this API. If there is another version of the API,
   * it will likely define another property, like define.amd2, to indicate
   * implementations that conform to that version of the API.
   *
   * An example of how it may be defined for an implementation that allows
   * loading more than one version of a module in an environment:
   *
   * @typedef {Object}
   */
  define.amd = {
    creator: 'AceMood',
    email: 'zmike86@gmail.com'
  };

  /**
   * 一般作为页面逻辑的入口, 提倡js初始化只调用一次require, 函数内部的异步加载用require.async.
   * 两种使用方式:
   * var mod = require('widget/a');
   * or
   * require(['widget/a'], function(wid_a) {
   *   wid_a.init();
   * });
   * @param {!Array|String} deps
   * @param {Function?} cb
   */
  function require(deps, cb) {
    // pass-in a config object
    if (typeOf(deps) === 'object' && !cb) {
      kerneljs.config(deps);
      return null;
    }
    // no deps
    if (typeOf(deps) === 'array' && deps.length === 0) {
      if (typeOf(cb) === 'function') {
        return cb();
      } else {
        return cb;
      }
    }

    // Type conversion
    // it's a single module dependency and with no callback
    if (typeOf(deps) === 'string') {
      deps = [deps];
    }

    var uid,
        _currentPath = getCurrentPath();
    if (cb) {
      // 'require' invoke can introduce an anonymous module,
      // it has the unique uid and id is null.
      uid = kerneljs.uidprefix + kerneljs.uid++;
      var mod = new Module({
        uid: uid,
        id: null,
        url: _currentPath,
        deps: deps,
        factory: cb,
        status: Module.STATUS.init
      });

      // convert dependency names to an object Array, of course,
      // if any rely module's export haven't resolved, use the
      // default name replace it.
      mod.depMods = map(deps, function(dep) {
        var path = resolveId(dep, _currentPath);
        return resolve(dep) || resolve(path);
      });

      load(mod);
      return null;

    } else {
      var _dep = resolveId(deps[0], _currentPath);
      // a simple require statements always be resolved preload.
      // so if length == 1 then return its exports object.
      var _mod = resolve(deps[0]);
      if (deps.length === 1 && _mod) {
        return _mod;
      } else {
        uid = kerneljs.cache.path2uid[_dep][0];
        return kerneljs.cache.mods[uid].exports || null;
      }
    }
  }


  /**
   * Whenever a module is prepared, means all its dependencies have already
   * been fetched and its factory function has executed. So notify all other
   * modules depend on it.
   * @param {Module} mod
   */
  function notify(mod) {

    fetchingList.remove(mod);

    // amd
    if (!mod.cjsWrapper) {
      mod.exports = typeOf(mod.factory) === 'function' ?
          mod.factory.apply(null, mod.depMods) : mod.factory;
    }
    // cmd
    else {
      mod.factory.apply(null, mod.depMods);
    }

    if (isNull(mod.exports)) {
      mod.exports = {};
    }

    mod.setStatus(Module.STATUS.complete);

    // Register module in global cache
    kerneljs.cache.mods[mod.uid] = mod;
    // two keys are the same thing
    if (mod.id) {
      kerneljs.cache.mods[mod.id] = mod;
    }

    // Dispatch ready event.
    // All other modules recorded in dependencyList depend on this mod
    // will execute their factories by order.
    var depandants = dependencyList[mod.url];
    if (depandants) {
      // Here I first delete it because a complex condition:
      // if a define occurs in a factory function, and the module whose
      // factory function is current executing, it's a callback executing.
      // which means the currentScript would be mod just been fetched
      // successfully. The url would be the previous one, and we store the
      // record in global cache dependencyList.
      // So we must delete it first to avoid the factory function execute twice.
      delete dependencyList[mod.url];
      forEach(depandants, function(dependant) {
        if (dependant.ready && dependant.status === Module.STATUS.fetching) {
          dependant.ready(mod);
        }
      });
    }
  }


  /**
   * Used in the CommonJS wrapper form of define a module.
   * @param {String} name
   * @param {Module} mod Pass-in this argument is to used in a cjs
   *   wrapper form, if not we could not refer the module and exports
   *
   * @return {Object}
   */
  function resolve(name, mod) {
    // step 1: parse built-in and already existed modules
    if (kerneljs.cache.mods[name]) {
      var currentPath = getCurrentPath(),
          path = resolveId(name, currentPath);
      // we check circular reference first, if it there, we return the
      // empty_mod immediately.
      if (kerneljs.cache.mods[name].status === Module.STATUS.complete ||
          checkCycle(path, mod)) {
        return kerneljs.cache.mods[name].exports;
      }
    }

    // step 2: cjs-wrapper form
    if (name === 'require') {
      return require;
    } else if (name === 'module') {
      return mod;
    } else if (name === 'exports') {
      return mod && mod.exports;
    }

    return null;
  }


  /**
   * A mechanism to check cycle reference.
   * More about cycle reference can be solved by design pattern, and a
   * well-designed API(Architecture) can avoid this problem, but in case
   * it happened, we do the same thing for dojo loader and specification
   * written on RequireJS website. See:
   *  'http://requirejs.org/docs/api.html#circular'
   *   and
   *  'http://dojotoolkit.org/documentation/tutorials/1.9/modules_advanced/'
   *
   * todo only simple cycle refer done here
   * @param {String} path A file path that contains the fetching module.
   *     We should resolve the module with url set to this dep and check its
   *     dependencies to know whether there  produce a cycle reference.
   * @param {Module|Object} mod current parse module.
   * @return {Boolean} true if there has a cycle reference and vice versa.
   */
  function checkCycle(path, mod) {
    var ret = false;
    var uid = kerneljs.cache.path2uid[path];
    var m;
    if (uid && (m = kerneljs.cache.mods[uid[0]])) {
      if (indexOf(dependencyList[mod.url], m) >= 0) {
        ret = true;
      }
    }

    return ret;
  }


  /**
   * Resolve path of the given id.
   * @param {String} id
   * @return {!(String|Object)}
   */
  require.toUrl = function(id) {
    return resolveId(id);
  };


  /**
   * Used to Load module after page loaded.
   * @param {!String} id Identifier or path to module.
   * @param {!Function} callback Factory function.
   */
  require.async = function(id, callback) {
    require([id], callback);
  };

  /**
   * 全局kerneljs对象
   * @typedef {Object}
   */
  var kerneljs = {};


  kerneljs.uid = 0;
  kerneljs.uidprefix = 'AceMood@kernel_';


  /**
   * 保存所有正在获取依赖模块的模块信息.
   * key是模块的uid, value是模块自身.
   * @typedef {Object}
   */
  var fetchingList = {
    mods: {},
    add: function(mod) {
      if (this.mods[mod.uid]) {
        kerneljs.trigger(kerneljs.events.error, [
              'current mod with uid: ' + mod.uid + ' and file path: ' +
              mod.url + ' is fetching now'
        ]);
      }
      this.mods[mod.uid] = mod;
    },
    clear: function() {
      this.mods = {};
    },
    remove: function(mod) {
      if (this.mods[mod.uid]) {
        this.mods[mod.uid] = null;
        delete this.mods[mod.uid];
      }
    }
  };


// Due to add module dependency when resolve id->path, we can not use
// module's uid as the key of dependencyList, so we use url here.
  /**
   * 记录模块的依赖关系. 如果模块状态置为complete, 则用此对象同志所有依赖他的模块项.
   * 因为解析依赖的时候一般是通过相对路径（除非预配置一些短命名id和路径的映射）
   * 这个结构是以path路径作为key, 模块数组作为value
   * @typedef {Object}
   */
  var dependencyList = {};


  /**
   * 如果某个模块处于fetching的状态则说明依赖的js模块文件正在下载, 在完成下载之前我们不希望同一个文件
   * 发起两次下载请求. define时会缓存到cache.path2uid对象中, 我们这里用path作为key标识模块文件正在下载.
   * @typedef {Object}
   */
  var sendingList = {};


  /**
   * 动态配置kerneljs对象. 目前配置对象的属性可以是:
   * # alias: 短命名id和长路径的映射关系. (todo)
   * # paths: 一个路径映射的hash结构, 详细看:
   *          http://requirejs.org/docs/api.html#config-paths
   * # baseUrl: 所有路经解析的基路径, 包括paths, 但模块内依赖的相对路径针对模块自身路径解析. (todo)
   */
  kerneljs.config = function(obj) {
    if (typeOf(obj) !== 'object') {
      throw 'config object must an object';
    }
    var key, k;
    for (key in obj) {
      if (hasOwn.call(obj, key)) {
        if (kerneljs[key]) {
          for (k in obj[key]) {
            kerneljs[key][k] = obj[key][k];
          }
        } else {
          kerneljs[key] = obj[key];
        }
      }
    }
  };


  /**
   * 全局缓存对象
   * @typedef {Object}
   */
  kerneljs.cache = {
    // 全局缓存uid和对应模块. 是一对一的映射关系.
    mods: {},
    // id2path记录所有的用户自定义id的模块. 在开发时不提倡自己写id但实际也可以自己写, 没啥意义
    // 因为请求还是以路径来做. 可以通过paths配置来require短id, 这个缓存对象在开发时会有不少缺失的模块,
    // 但在打包后id已经自生成所以它会记录完全. 这个结构是一个一对一的结构.
    id2path: {},
    // 理论上每个文件可能定义多个模块, 也就是define了多次. 这种情况应该在开发时严格避免,
    // 但经过打包之后一定会出现这种状况. 所以我们必须要做一些处理, 也使得这个结构是一对多的.
    path2uid: {},
    // kerneljs的订阅者缓存
    events: {}
  };


// 基础配置
  kerneljs.config({
    baseUrl: '',
    debug: true,
    paths: {}
  });


  /**
   * 重置全局缓存
   */
  kerneljs.reset = function() {
    this.cache.mods = {};
    this.cache.id2path = {};
    this.cache.path2uid = {};
  };


  /**
   * 用于区分开发环境和部署环境的接口地址. 便于构建时分析.
   * 在源码中可以调用ajax接口, kerneljs.replace('/ajax/endpoint').
   * 构建时会根据配置将所有调用 kerneljs.replace的地方替换为线上地址.
   * @param {String} endpoint
   */
  kerneljs.replace = function(endpoint) {
    return endpoint;
  };


  /**
   * 区分开发环境和部署环境资源地址定位，便于构建时分析。
   * @param {!String} url 相对于本次js模块的地址
   * @returns {!String} 返回线上绝对路径的地址
   */
  kerneljs.url = function(url) {
    return url;
  };


  /** 全局导出 APIs */
  global.require = global._req = require;
  global.define = global._def = define;
  global.kerneljs = kerneljs;

  /**
   * kerneljs内部分发的事件名称
   * @typedef {Object}
   */
  kerneljs.events = {
    create: 'create',
    startFetch: 'start:fetch',
    endFetch: 'end:fetch',
    complete: 'complete',
    error: 'error'
  };


  /**
   * 订阅事件
   * @param {String} eventName 事件名称定义在event.js
   * @param {Function} handler 事件处理器
   * @param {*} context 事件处理器上下文
   */
  kerneljs.on = function(eventName, handler, context) {
    if (!this.cache.events[eventName]) {
      this.cache.events[eventName] = [];
    }
    this.cache.events[eventName].push({
      handler: handler,
      context: context
    });
  };


  /**
   * 触发订阅事件
   * @param {String} eventName 事件名称定义在event.js
   * @param {Array.<Object>} args 参数
   */
  kerneljs.trigger = function(eventName, args) {
    // 缓存防止事件处理器改变kerneljs.cache对象
    var arr = this.cache.events[eventName];
    if (arr) {
      forEach(arr, function(obj) {
        obj.handler.apply(obj.context, args);
      });
    }
  };

}(this));
