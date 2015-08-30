define(function (require, exports, module) {

  'use strict';

  var API = '__APIDOMAIN__';

  exports.exec = function(str) {
    var arr = str.split('');
    arr = arr.reverse();
    return arr.join('');
  };

});