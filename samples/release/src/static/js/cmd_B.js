define(function (require, exports, module) {

  var lib = require('../vendor/lib');
  var url = kerneljs.url('../swf/ZeroClipboard.swf');

  module.exports = {
    name: lib.name,
    url: url
  }
});