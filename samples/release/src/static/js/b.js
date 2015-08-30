define(function (require, exports, module) {

  var lib = require('../vendor/lib');
  var url = kerneljs.url('../swf/ZeroClipboard.swf');

  module.exports = {
    name: lib.name,
    url: url
  }
});
/*
define(['../vendor/lib'], function (lib) {
  var url = kerneljs.url('../swf/ZeroClipboard.swf');

  return {
    name: lib.name,
    url: url
  }
});*/