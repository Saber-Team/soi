define(function(require, module, exports) {

  var lib = require('../vendor/lib');
  var url = kerneljs.url('../swf/ZeroClipboard.swf');

  module.exports = {
    name: lib.name,
    url: url
  }
});