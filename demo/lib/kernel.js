/**
 * author: AceMood
 * Email: zmike86@gmail.com
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

  "use strict";


// store useful props
  var OP = Object.prototype,
    AP = Array.prototype,
    native_forEach = AP.forEach,
    native_map = AP.map,
    hasOwn = OP.hasOwnProperty,
    toString = OP.toString;


// use such an object to determine cut down a forEach loop;
  var break_obj = {};


// initialize a module
  var empty_mod = {
    id: null,
    uid: null,
    url: null,
    status: null,
    exports: {}
  };


// for no-op function, used for a default callback function
  function noop() {}


  /**
   * if a module with in the same id exists, then define with the id
   * will fail. we throw an error with useful message.
   */
  function exist_id_error(id) {
    throw "more then one module defined with the same id: " + id;
  }


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
      ret = arr.map(fn, opt_context)
    } else if (arr.length === +arr.length) {
      for (var i = 0; i < arr.length; ++i) {
        ret.push(fn.call(opt_context || null, arr[i], i, arr))
      }
    }
    return ret;
  }


  /**
   * NOTE The forEach function is intentionally generic; it does not require that
   * its this value be an Array object. Therefore it can be transferred to other kinds of objects
   * for use as a method. Whether the forEach function can be applied successfully to a host object
   * is implementation-dependent.
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
        if (fn.call(opt_context, arr[i], i, arr) === break_obj)
          break;
      }
    }
  }


  /**
   * find a target in an array, return the index or return -1;
   * @param {Array} arr
   * @param {*} tar
   * @return {Number}
   */
  function indexOf(arr, tar) {
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === tar)
        return i;
    }
    return -1;
  }


  var type_map = {
    "[object Object]": "object",
    "[object Array]" : "array",
    "[object Function]": "function",
    "[object RegExp]": "regexp",
    "[object String]": "string",
    "[object Number]": "number"
  };


  /**
   * detect the obj's type
   */
  function typeOf(obj) {
    return type_map[toString.call(obj)]
  }


  /**
   * If obj is undefined or null
   * @param obj
   * @return {Boolean}
   */
  function isNull(obj) {
    return obj === void 0 || obj === null;
  }


  var doc = document,
    head = doc.head || doc.getElementsByTagName("head")[0],
// It's a classical bug in IE6 found in jQuery.
// see more: 'http://dev.jquery.com/ticket/2709'
    $base = doc.getElementsByTagName("base")[0];


  if ($base) {
    head = $base.parentNode;
  }


// current adding script node
  var currentAddingScript,
// In older FF, do not support script.readyState, so we only use this prop in IEs.
// Although 'onload' in IE9 & IE10 have problems, but I do not
// care the issure, and whatever async is true or false. We just
// remove node in document as the callback of javascript loaded.
// Read more about the bug:
// 'https://connect.microsoft.com/IE/feedback/details/729164/'
// + 'ie10-dynamic-script-element-fires-loaded-readystate-prematurely'
// 'https://connect.microsoft.com/IE/feedback/details/648057/'
// + 'script-onload-event-is-not-fired-immediately-after-script-execution'
    useInteractive = ('readyState' in doc.createElement("script")),
// loop all script nodes in doc, if one's readyState is 'interactive'
// means it's now executing;
    interactiveScript;


  /**
   * Load a module use dynamic script insertion.
   * once confirm the module loaded and executed, then update
   * cache's info and exec module's factory function.
   * @param {String} url File path to fetch.
   * @param {String} name Original name to require this module.
   *   maybe a top-level name, relative name or absolute name.
   */
  function fetch(url, name) {
    var script = doc.createElement("script");
    script.charset = "utf-8";
    script.async = true;
    // custom attribute to remember the original required name
    // which written in dependant module.
    script.kernel_name = name;

    // Event binding
    script.onreadystatechange = script.onload = script.onerror = function () {
      script.onreadystatschange = script.onload = script.onerror = null;
      interactiveScript = null;
      if (!script.readyState || /complete/.test(script.readyState)) {
        // head.removeChild(script);
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
   * get all script nodes in document at present
   * @return {NodeList}
   */
  function scripts() {
    return doc.getElementsByTagName("script");
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
        if (interactiveScript && interactiveScript.readyState == "interactive")
          return interactiveScript;

        _scripts = scripts();
        forEach(_scripts, function(script) {
          if (script.readyState == "interactive") {
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

      if (!stack) return ret;

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
       * at file:///D:/Develop/SOI/lib/kernel.js:261:15
       * at getCurrentScript (file:///D:/Develop/SOI/lib/kernel.js:294:7)
       * at getCurrentPath (file:///D:/Develop/SOI/lib/kernel.js:314:16)
       * at require (file:///D:/Develop/SOI/lib/kernel.js:563:29)
       * at Function.require.async (file:///D:/Develop/SOI/lib/kernel.js:1178:5)
       * at HTMLButtonElement.<anonymous> (file:///D:/Develop/SOI/demo/assets/js/app.js:25:17)
       * at F (file:///D:/Develop/SOI/demo/lib/events/util.js:2:4218)
       * at q (file:///D:/Develop/SOI/demo/lib/events/util.js:2:1034)
       * at HTMLButtonElement.<anonymous> (file:///D:/Develop/SOI/demo/lib/events/util.js:2:2610)"
       *
       * IE11 e.g.
       * at Anonymous function (file:///D:/Develop/SOI/lib/kernel.js:294:7)
       * at getCurrentPath (file:///D:/Develop/SOI/lib/kernel.js:314:16)
       * at Global code (file:///D:/Develop/SOI/lib/kernel.js:563:29)
       */
      var e = stack.indexOf(" at ") != -1 ? " at " : "@";
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
        if (path == stack) {
          ret = script;
          return break_obj;
        }
      });
      return ret;
    })();
  }


  /**
   * Retrieve the absolute path of script node cross browser.
   * @param {HTMLScriptElement} script
   * @return {*}
   */
  function getAbsPathOfScript(script) {
    return script.hasAttribute ? script.src : script.getAttribute("src", 4);
  }


  /**
   * Retrieve the current executing script node's
   * absolute path.
   * @return {*|String}
   */
  function getCurrentPath() {
    var node = getCurrentScript();
    return node && getAbsPathOfScript(node);
  }


// A regexp to filter `require('xxx')`
  var cjsRequireRegExp = /\brequire\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g,
// A regexp to drop comments in source code
    commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;


  /**
   * define a module.
   * The specification defines a single function "define" that is available
   * as a free variable or a global variable. The signature of the function:
   * define(id?, dependencies?, factory);
   *
   * @param {String|Array|Function|Object} id
   * @param {Array|Function|Object} deps
   * @param {(Function|Object)?} factory
   */
  function define(id, deps, factory) {
    var mod,
      cache = kernel.cache,
      uid = kernel.uidprefix + kernel.uid++;

    // document.currentScript stuned me in a callback and
    // event handler conditions.
    // but if define in a single file, this could be trusted.
    var base = getCurrentPath();

    // deal with optional arguments
    if (typeOf(id) != "string") {
      factory = deps;
      deps = id;
      id = null;
    }
    if (typeOf(deps) != "array") {
      factory = deps;
      deps = null;
    }

    // only when user-defined id presents, we record it
    // in id2path cache. First check module with the same id.
    if (id) {
      if (cache.id2path[id]) return exist_id_error(id);
      cache.id2path[id] = base;
      cache.mods[id] = empty_mod;
    }

    // record
    if (cache.path2uid[base]) cache.path2uid[base].push(uid);
    else cache.path2uid[base] = [uid];

    // register module in global cache
    mod = cache.mods[uid] = empty_mod;

    // If no name, and factory is a function, then figure out if it a
    // CommonJS thing with dependencies. I don't intend to support it.
    // But many projects used RequireJS may depend on this functional.
    // Code below in the if-else statements lent from RequireJS
    if (!deps && typeOf(factory) == "function") {
      deps = [];
      // Remove comments from the callback string,
      // look for require calls, and pull them into the dependencies,
      // but only if there are function args.
      if (factory.length) {
        factory
          .toString()
          .replace(commentRegExp, "")
          .replace(cjsRequireRegExp, function(match, quote, dep) {
            deps.push(dep);
          });

        // May be a CommonJS thing even without require calls, but still
        // could use exports, and module. Avoid doing exports and module
        // work though if it just needs require.
        // REQUIRES the function to expect the CommonJS variables in the
        // order listed below.
        deps = (factory.length === 1 ? ["require"] : ["require", "exports", "module"]).concat(deps);
      }
    }

    // init current module
    mod = cache.mods[uid] = new Module({
      uid: uid,
      id: id,
      url: base,
      deps: deps,
      factory: factory,
      status: Module.STATUS.uninit
    });

    // if in a concatenate file define will occur first,
    // there would be no kernel_name here.
    var name = getCurrentScript().kernel_name;
    if (name && isTopLevel(name) && !mod.id)
      mod.id = name;

    // fill exports list to depMods
    if (mod.deps && mod.deps.length > 0) {
      mod.deps = map(mod.deps, function(dep, index) {
        if (dep == "exports" || dep == "module")
          mod.cjsWrapper = true;

        var inject = resolve(dep, mod);
        if (inject) mod.depMods[index] = inject;
        return dep;
      });
    }

    // load dependencies.
    load(mod);
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
   * @type {Object}
   */
  define.amd = {
    creator: "AceMood",
    email: "zmike86@gmail.com",
    version: "0.9"
  };


  /**
   * Load all dependencies of a specific module.
   * @param {Object|Module} mod Whose deps to be fetched.
   */
  function load(mod) {

    var cache = kernel.cache;
    var count = mod.deps.length;
    var inPathConfig = kernel.paths && kernel.paths[mod.id] ? true : false;
    // todo I doubt about the uri in paths config and all its rel path
    // will be resolved relative to location.href, See
    // test case: config_path_relative for more information.
    var currentPath = inPathConfig ? loc.href : getCurrentPath();

    // Record in fetchingList to represent the module is now
    // fetching its dependencies.
    fetchingList.add(mod);

    // Update mod's status
    mod.status = Module.STATUS.fetching;

    // Register module in global cache with an empty.
    // export for later checking if its status is available.
    if (!cache.mods[mod.uid])
      cache.mods[mod.uid]= empty_mod;

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
        (cache.mods[uid[0]].status == Module.STATUS.complete ||
          checkCycle(path, mod))) {
        --count;
        mod.depMods[index] = cache.mods[uid[0]].exports;

        // It's a user-defined or not been fetched file.
        // If it's a user-defined id and not config in global alias,
        // it will produce a 404 error.
      } else {
        // record this mod depend on the dep current now.
        if (!dependencyList[path])
          dependencyList[path] = [mod];
        else if (indexOf(dependencyList[path], mod) < 0)
          dependencyList[path].push(mod);

        if (!sendingList[path]) {
          sendingList[path] = true;
          // script insertion
          fetch(path, name);
        }
      }
    });

    // If all module have been cached.
    // In notify, mod will be removed from fetchingList
    count == 0 && notify(mod);
  }


  /**
   * set up page logic or manually request a module asynchronously.
   * two forms usage:
   * var mod = require("module");
   * or
   * require(["module"], function(module){
 *
 * });
   * @param {!Array|String} deps
   * @param {Function?} cb
   */
  function require(deps, cb) {
    // pass-in a config object
    if (typeOf(deps) == "object" && !cb) {
      kernel.config(deps);
      return null;
    }
    // no deps
    if (typeOf(deps) == "array" && deps.length == 0) {
      if (typeOf(cb) == "function") return cb();
      else return cb;
    }

    // Type conversion
    // it's a single module dependency and with no callback
    if (typeOf(deps) == "string")
      deps = [deps];

    var uid, _currentPath = getCurrentPath();
    if (cb) {
      // 'require' invoke can introduce an anonymous module,
      // it has the unique uid and id is null.
      uid = kernel.uidprefix + kernel.uid++;
      var mod = new Module({
        uid: uid,
        id: null,
        url: _currentPath,
        deps: deps,
        factory: cb,
        status: Module.STATUS.uninit
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
      if (deps.length == 1 && _mod)
        return _mod;
      else {
        uid = kernel.cache.path2uid[_dep][0];
        return kernel.cache.mods[uid].exports || null;
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
    if (!mod.cjsWrapper)
      mod.exports = typeOf(mod.factory) == "function" ?
        mod.factory.apply(null, mod.depMods) : mod.factory;
    // cmd
    else mod.factory.apply(null, mod.depMods);

    if (isNull(mod.exports)) {
      mod.exports = {};
    }

    mod.status = Module.STATUS.complete;

    // Register module in global cache
    kernel.cache.mods[mod.uid] = mod;
    // two keys are the same thing
    if (mod.id) {
      kernel.cache.mods[mod.id] = mod;
    }

    // Dispatch ready event.
    // All other modules recorded in dependencyList depend on this mod
    // will execute their factories by order.
    var depandants = dependencyList[mod.url];
    if (depandants) {
      // Here I first delete it because a complex condition:
      // if a define occurs in a factory function, and the module whose
      // factory function is current executing, it's a callback executing.
      // which means the currentScript would be mod just been fetched successfully.
      // the url would be the previous one. and we store the record in global cache
      // dependencyList.
      // So we must delete it first to avoid the factory function execute twice.
      delete dependencyList[mod.url];
      forEach(depandants, function(dependant) {
        if (dependant.ready && dependant.status == Module.STATUS.fetching)
          dependant.ready(mod);
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
    if (kernel.builtin[name])
      return kernel.builtin[name];

    if (kernel.cache.mods[name]) {
      var currentPath = getCurrentPath(),
        path = resolveId(name, currentPath);
      // we check circular reference first, if it there, we return the
      // empty_mod immediately.
      if (kernel.cache.mods[name].status == Module.STATUS.complete ||
        checkCycle(path, mod))
        return kernel.cache.mods[name].exports;
    }

    // step 2: cjs-wrapper form
    if (name == "require") return require;
    else if (name == "module") return mod;
    else if (name == "exports") return mod && mod.exports;

    return null;
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
    var uid = kernel.cache.path2uid[path];
    var m;
    if (uid && (m = kernel.cache.mods[uid[0]])) {
      if (indexOf(dependencyList[mod.url], m) >= 0) {
        ret = true;
      }
    }

    return ret;
  }


// @global
  var kernel = {};


// preserve existed kernel object;
  if (global.kernel) {
    kernel._kernel = global.kernel;
  }


// universal global module id
  kernel.uid = 0;
  kernel.uidprefix = "AceMood@kernel_";


// All modules being fetched means the module's dependencies
// is now fetching, and the key is mod's uid, value is mod itself;
  var fetchingList = {
    mods: {},
    add: function(mod) {
      if (this.mods[mod.uid])
        throw "current mod with uid: " + mod.uid +
          " and file path: " + mod.url + " is fetching now";
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


// If requiring a module, then record it here. So that once the
// module complete, notify all its dependants.
// Due to add module dependency when resolve id->path, we can not use
// module's uid as the key of dependencyList, so we use url here,
// the hash will be path -> [mod] constructor.
  var dependencyList = {};


// If a module a fetching now means the corresponding script is loading now,
// before it complete loaded, we should not fetch it twice, but only when
// define the module it would record in the 'cache.path2uid', so here we just
// record here to avoid fetch twice.
// the hash will be path -> bool constructor.
  var sendingList = {};


  /**
   * Dynamic config kernel.
   * property of obj can be:
   * [alias]: a collection of short names will be used to stand for
   *     a long name or long path module.
   * [paths]: a hash
   * [baseUrl]:
   */
  kernel.config = function(obj) {
    if (typeOf(obj) != "object")
      throw "config object must an object";
    var key, k;
    for (key in obj) {
      if (hasOwn.call(obj, key)) {
        if (kernel[key]) {
          for (k in obj[key]) {
            kernel[key][k] = obj[key][k];
          }
        } else
          kernel[key] = obj[key];
      }
    }
  };


// Global cache.
  kernel.cache = {
    // use a global cache to store uid-module pairs.
    // each uid mapping to a unique module, so it's a
    // one-to-one hash constructor.
    mods: {},
    // and id2path record all module that have a user-defined id.
    // its a pairs; not all modules have user-defined id, so this object
    // if lack of some modules in debug mode;
    // But imagine build, all modules will have self-generated id.
    // It's a one-to-one hash constructor, because a user-defined id
    // can only defined in one file.
    id2path: {},
    // each file may have multiple modules. so it's a one-to-many hash
    // constructor.
    path2uid: {}
  };


// default built-in modules
// map the short name and relative path?
  kernel.config({
    baseUrl: "",
    debug: true,
    builtin: {

    }
  });


  /**
   * Clear all cache.
   */
  kernel.reset = function() {
    kernel.cache = {
      mods: {},
      id2path: {},
      path2uid: {}
    };
  };


// exports APIs functions
  global.require = require;
  global.define = define;
  global.kernel = kernel;


// and a directory file path must be ends with a slash (back slash in window)
  var dirRegExp = /\/$/g,
// whether a path to a file with extension
    fileExtRegExp = /\.(js|css|tpl|txt)$/;


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
    // 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#section_5'
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
    // var _mod = kernel.cache.mods[id];
    if (id == "require" || id == "module" ||
      id == "exports" /*|| (_mod &&  _mod != empty_mod)*/)
      return id;

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
    var conjuction = id.charAt(0) == "/" ? "" : "/";
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
    if (dirRegExp.test(p))
      return p.slice(0, -1);
    // Here I used to use /\//ig to split string, but unfortunately
    // it has serious bug in IE<9. See for more:
    // 'http://blog.stevenlevithan.com/archives/cross-browser-split'.
    p = p.split("/");
    p.pop();
    return p.join("/");
  }


  /**
   * Alias will appear at first word of path.
   * So replace it if exists in kernel.alias.
   * @param {string} p
   * @return {string} s
   */
  function parseMap(p) {
    var parts = p.split("/"),
      part = parts[0];
    if (kernel.alias[part]) {
      part = kernel.alias[part];
    }
    parts.shift();
    return [part].concat(parts).join("/");
  }


  /**
   * Alias will appear at head part of path.
   * So replace it if exists in kernel.paths.
   * @param {String} p
   * @return {String} s
   */
  function parsePaths(p) {
    var ret = [];
    if (kernel.paths) {
      var part = p;
      var parts = p.split("/");
      while (!(part in kernel.paths) && parts.length) {
        ret.unshift(parts.pop());
        part = parts.join("/");
      }
      p = kernel.paths[part] ? kernel.paths[part] : part;
    }
    return p + ret.join("/");
  }


  /**
   * pkg name can also impact on path resolving.
   * After paths, we should find it in pkg configuration.
   * So replace it if exists in kernel.packages.
   * @param {String} p
   * @return {String} s
   */
  function parsePackages(p) {
    var pkgs = kernel.packages,
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
      })
    }
    return p;
  }


  /**
   * Represents a module.
   * uid is a self-generated global id to identify a unique module.
   * id is a user-defined name for the module, it's a optinal but if we
   *   lost the id property, it will break down some of the test cases
   *   in AMDJS(see anon_circular case), so I change the AMDJS serveral
   *   cases to protect this.
   * url is the file path where to fetch the module.
   * deps is an array to store the dependency module in require or define
   *   form, also it will retrieve the requrie statements in function's
   *   string value in case that a CMD wrapper is used.
   *
   * status is a int value to know the current module state, came from Module.STATUS.
   * factory and exports is the callback function to export the module's value and
   * the real value of the module.
   *
   * @constructor
   */
  function Module(obj) {
    this.uid = obj.uid;
    this.id = obj.id || null;
    this.url = obj.url;
    this.deps = obj.deps || [];
    this.depMods = new Array(this.deps.length);
    this.status = obj.status || Module.STATUS.uninit;
    this.factory = obj.factory || noop;
    this.exports = {};
  }


// Four states of module.
// 'uninit' module is only inited but without fetching its deps.
// 'fetching' is fetching its deps now but not execute its factory yet.
// 'loaded' is specificated in IE means a js file is loaded.
// 'complete' is module finished resolve and has cached its exports object.
  Module.STATUS = {
    "uninit"    : 0,
    "fetching"  : 1,
    "loaded"    : 2,
    "complete"  : 3
  };


  /**
   * When a mod prepared, then will notify all the modules depend on it.
   * So pass the mod and invoke depandant.ready(mod);
   * @param {Module|Object} mod
   */
  Module.prototype.ready = function(mod) {
    if (mod.url) {
      if (kernel.paths && kernel.paths[this.id])
        var inPathConfig = true;
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
   * check if all mod's deps have been ready.
   * Here has a problem. if we do the type checking,
   * the string exports will be filtered, but it's possible
   * that module export an string as a module itself,
   * so we do the
   */
  Module.prototype.checkAllDepsOK = function() {
    var ok = true;
    // I do not use forEach here because native forEach will
    // pass through all values are undefined, so it will introduce
    // some tricky results.
    for(var i= 0; i < this.depMods.length; ++i) {
      if (isNull(this.depMods[i])) {
        ok = false;
        break;
      }
    }
    return ok;
  };

  require.async = function(id, callback) {
    require([id], callback);
  };

  require.url = function(url) {
    return String(url);
  };

  global._req = require;
  global._def = define;


}(this));