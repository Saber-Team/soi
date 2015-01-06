(function(global) {

  'use strict';

  var __moduleCache__ = {

  };

  function define(id, deps, factory) {
    var list = deps.map(function(id) {
      var dep = __moduleCache__[id];
      if (!dep) {
        throw "Module with id: " + id + "has not been registered!";
      }
      return dep;
    });
    __moduleCache__[id] = typeof factory === "function" ?
          factory.apply(null, list) : factory;
  }

  function require(deps, factory) {
    var list = deps.map(function(id) {
      var dep = __moduleCache__[id];
      if (!dep) {
        throw "Module with id: " + id + "has not been registered!";
      }
      return dep;
    });
    factory.apply(null, list);
  }

  require.async = function (src, cb) {
    var doc = document, pre = document.getElementsByTagName('script')[0];
    var script = doc.createElement('script');
    script.async = 1;
    script.onreadystatechange = script.onload = script.onerror =
      function() {
        if (!script.readyState || /complete/.test(script.readyState))
          cb();
      };
    script.src = '';
    pre.parentNode.insertBefore(script, pre);
  };

  global._def = define;
  global._req = require;
  global.oslojs = {
    version: "%V",
    maintainer: "Saber-Team@Sogou-Inc.com"
  };

})(this);