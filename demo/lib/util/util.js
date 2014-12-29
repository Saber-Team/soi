/**
 * @fileoverview Oslo框架基础函数
 * @author Leo.Zhang
 * @email zmike86@gmail.com
 */

define(function() {

  'use strict';

  /**
   * 管理对象, 对每个对象增加全局唯一ID, 自定义属性但也修改了对象
   * @type {string}
   * @private
   */
  var UID_PROP = 'oslo_uid_' + ((Math.random() * 1e9) >>> 0);

  /**
   * UID计数, 简单的整形递增
   * @type {number}
   * @private
   */
  var uidCounter_ = 0;
  var AP = Array.prototype,
    OP = Object.prototype;

  /**
   * 原生的bind实现. fn.bind(self_obj, var_args)
   * @param {Function} fn 要执行的函数
   * @param {Object|undefined} selfObj 函数上下文
   * @param {...*} var_args 预先提供的一些参数, 可以把函数作为partial使用
   * @return {!Function} 被部分参数填充过的函数, 并且绑定了执行上下文. 原生bind也可以这么使用
   * @private
   */
  function bindNative_(fn, selfObj, var_args) {
    // fn.bind.call(fn,selfObj,var_args)的一个变体就是
    // fn.call(fn.bind, fn, selfObj, war_args)
    return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
  }

  /**
   * 纯原生JavaScript实现的bind
   * @param {Function} fn 要执行的函数
   * @param {Object|undefined} selfObj 函数上下文
   * @param {...*} var_args 预先提供的一些参数，可以把函数作为partial使用
   * @return {!Function} 被部分参数填充过的函数, 并且绑定了执行上下文. 原生bind也可以这么使用
   * @private
   */
  function bindJs_(fn, selfObj, var_args) {
    if (!fn) throw new Error();
    if (arguments.length > 2) {
      var boundArgs = AP.slice.call(arguments, 2);
      return function() {
        // 将之前保留的形参插入到新参数之前.
        var newArgs = AP.slice.call(arguments);
        AP.unshift.apply(newArgs, boundArgs);
        return fn.apply(selfObj, newArgs);
      };
    } else {
      return function() {
        return fn.apply(selfObj, arguments);
      };
    }
  }

  /**
   * 判断对象是否一个真数组.
   * @param {*} val 测试的对象.
   * @return {boolean}
   */
  function isArray(val) {
    return OP.toString.call(val) === '[object Array]';
  }

  /**
   * 判断对象是否类数组. NodeList或者一个带有length属性的对象都会通过测试.
   * @param {*} val 测试的对象.
   * @return {boolean} 该对象是否类数组.
   */
  function isArrayLike(val) {
    if (!val)
      return false;
    var type = typeof val;
    return isArray(val) || type === 'object' && typeof val.length === 'number';
  }

  /**
   * 判断给定值是否一个对象. typeof对于null也会返回'object'所以要剔除.
   * 同理Object.prototype.toString.call对于undefined和null在IE678中也返回'[object Object]'.
   * 最终我选择function也算作对象, 因为它本身可以存储属性.
   * Element和NodeList的原因同上, 因为也可以绑定js变量为属性所以isObject返回true.
   * 对于特殊对象arguments，同null的情况一样。
   * @param {*} val 测试对象.
   * @return {boolean}
   */
  function isObject(val) {
    var type = typeof val;
    return type === 'object' && val !== null || type === 'function';
    // 用Object(val) === val也能达到目的但性能较慢,特别是val不是个object的时候.
  }

  /**
   * 类型功能在bind方法里也有, 这个方法不需要'this object'.
   * 当目标函数已经绑定的时候很有用.
   * 用法:
   * var g = partial(f, arg1, arg2);
   * g(arg3, arg4);
   *
   * @param {Function} fn 函数.
   * @param {...*} var_args 预提供的形参.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.
   */
  function partial(fn, var_args) {
    var args = AP.slice.call(arguments, 1);
    return function() {
      // 将之前保留的形参插入到新参数之前.
      var newArgs = AP.slice.call(arguments);
      newArgs.unshift.apply(newArgs, args);
      return fn.apply(this, newArgs);
    };
  }

  /**
   * 在脚本加载的时候判断应该使用的bind版本
   * @return {Function}
   */
  var bindFn = (function() {
    var fn;
    // NOTE: 如果开发者在Chrome插件环境中引入了Oslo框架, 意味着插件环境中的
    // Function.prototype.bind实现会调用util.bind而不是原生方法. 还有,我们不能
    // 在util.bind和Function.prototype.bind之间产生循环调用, 所以我在这里做个
    // 判断保证调用正确的代码.
    if (Function.prototype.bind &&
      Function.prototype.bind.toString().indexOf('native code') !== -1) {
      fn = bindNative_;
    } else {
      fn = bindJs_;
    }

    return fn;
  })();


  // 标识window.eval是否全局作用域执行代码
  // @type {?boolean}
  var evalWorksForGlobals_ = null;

  /**
   * 在全局上下文环境中对js字符串求值, IE下用execScript方法, 其他浏览器用eval方法.
   * 如果window.eval并非在全局作用域执行代码(for example, in Safari), 创建script标签.
   * 否则抛出异常.
   * @param {string} script JavaScript代码.
   */
  var globalEval = function(script) {
    if (window.execScript) {
      window.execScript(script, 'JavaScript');
      // 不能直接用window.eval严格模式下会有警告
      // 因此采用这种方式判断
    } else if ('eval' in window) {
      // 是否正常工作
      if (evalWorksForGlobals_ === null) {
        window.eval('var _et_ = 1;');
        if (typeof window['_et_'] !== 'undefined') {
          delete window['_et_'];
          evalWorksForGlobals_ = true;
        } else {
          evalWorksForGlobals_ = false;
        }
      }

      if (evalWorksForGlobals_) {
        window.eval(script);
      } else {
        var doc = window.document;
        var scriptElt = doc.createElement('script');
        scriptElt.type = 'text/javascript';
        scriptElt.defer = false;
        // Note: can't use .innerHTML since "t('<test>')" will fail and
        // .text doesn't work in Safari 2.  Therefore we append a text node.
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt);
      }
    } else {
      throw Error('Oslo.util.globalEval not available');
    }
  };

  return {
    /**
     * 为要执行的函数提供上下文,同时也可以预提供一些形参. 返回一个spec函数.
     * 调用时加的形参会附加在预提供形参的后面.
     * 用法:
     * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
     * barMethBound('arg3', 'arg4');</pre>
     *
     * @param {?function(this:T, ...)} fn 要执行的函数
     * @param {T} selfObj 函数上下文
     * @param {...*} var_args 预先提供的一些参数，可以把函数作为partial使用
     * @return {!Function} A partially-applied form of the function bind() was
     *     invoked as a method of.
     * @template T
     */
    bind: function(fn, selfObj, var_args) {
      return bindFn.apply(null, arguments);
    },
    // 这个属性在一些模块中有特殊用处, 会利用debug模块的调试信息.
    // 本意在产品形态中用更简单的util模块代替此模块, 那时debug
    // 会设置成为false.
    DEBUG: true,
    partial: partial,
    globalEval: globalEval,
    /**
     * 简单的对象混入, 更多问题参考Object.extend方法.
     * @param {Object} target Target.
     * @param {Object} source Source.
     * @return {Object}
     */
    mixin: function(target, source) {
      for (var x in source) {
        target[x] = source[x];
      }
      return target;
    },
    isArray: isArray,
    isArrayLike: isArrayLike,
    /**
     * 判断是否一个函数
     * @param {*} val
     * @return {boolean}
     */
    isFunction: function(val) {
      return typeof val === 'function';
    },
    /**
     * 判断是否一个数字
     * @param {*} val
     * @return {boolean}
     */
    isNumber: function(val) {
      return typeof val === 'number';
    },
    /**
     * 返回是否一个字符串. 这里调用Object.prototype.toString比较多余.
     * @param {*} val 要测试的对象.
     * @return {boolean}
     */
    isString: function(val) {
      return typeof val === 'string';
    },
    isObject: isObject,
    /**
     * 判断一个对象是否undefined或者null
     * @param val
     * @return {Boolean}
     */
    isNull: function(val) {
      return val === (void 0) || val === null;
    },
    /**
     * 测试对象是否一个undefined值.
     * Note: 如果只是比较obj === undefined不可靠. 特别是如果一个对象的属性设为undefined
     * 的时候, 这时候用in去判断比较好. 还有就是这些都是假设undefined并未被赋予其他值.
     * @param {*} val 测试对象.
     * @return {boolean}
     */
    isDef: function(val) {
      return val !== (void 0);
    },
    /**
     * 取得对象上的UID. 不同sessions间对象的UID会改变,因为是每次随机生成,不在当前JS
     * 生命周期了. 在函数的原型上生成UID不安全.
     * @param {Object} obj 对象.
     * @return {number} UID.
     */
    getUid: function(obj) {
      if (obj === null) {
        throw new Error('Can not get uid from null');
      }
      // Opera中有window.hasOwnProperty方法但永远返回false. 所以我们不用这个方法检测.
      // As a consequence the unique ID generated for BaseClass.prototype
      // and SubClass.prototype will be the same.
      return obj[UID_PROP] || (obj[UID_PROP] = ++uidCounter_);
    },
    /**
     * 移除对象上的UID. 如果该对象之前用的getUid,此处相当于undo这个操作.
     * @param {Object} obj 要移除属性的对象.
     */
    removeUid: function(obj) {
      if (obj === null)
        throw new Error('Can not remove a uid from null');

      // IE中, DOM节点并非是Object的实例并且delete dom节点的属性会抛出异常.
      // 所以要用removeAttribute.
      if ('removeAttribute' in obj)
        obj.removeAttribute(UID_PROP);
      /** @preserveTry */
      try {
        delete obj[UID_PROP];
      } catch (ex) {}
    },
    /**
     * 原型继承
     * @param {Function} sub 子类
     * @param {Function} sup 父类
     */
    inherits: function(sub, sup) {
      /** @constructor */
      function TempCtor() {}
      TempCtor.prototype = sup.prototype;
      sub.superClass_ = sup.prototype;
      sub.prototype = new TempCtor();
      /** @override */
      sub.prototype.constructor = sub;
    },
    /**
     * 若一个对象含有dispose()则析构该对象.
     * @param {*} obj
     */
    dispose: function(obj) {
      if (obj && typeof obj.dispose === 'function') {
        obj.dispose();
      }
    },
    /**
     * 默认的空函数
     * @return {void} Nothing.
     */
    nullFunction: function() {},
    /**
     * 用于在抽象类中定义抽象方法，需要子类覆盖
     * @type {!Function}
     * @throws {Error} when invoked to indicate the method should be overridden.
     */
    abstractMethod: function() {
      throw Error('unimplemented abstract method');
    },
    /**
     * 全局上下文, 通常是 'window'.
     * 重构: 之前是this, 在严格模式下不会提示警告,但在代码执行时由于在闭包内
     * 此时会是undefined, 因此这里写死window
     */
    global: window,
    /**
     * @return {number} 返回1970年1月1日0时至今的毫秒数.
     */
    now: Date.now || function() {
      // 相当于调用getTime().
      return +new Date();
    }
  };
});