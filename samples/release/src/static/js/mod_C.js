define(function () {

  'use strict';

  var API = '__APIDOMAIN__';
  return {
    exec: function(str) {
      var arr = str.split('');
      arr = arr.reverse();
      return arr.join('');
    }
  };
});