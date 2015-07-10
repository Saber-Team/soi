define("_3", [], function () {
  return {
    name: 'lib'
  };
});
define("_1", [], {"name":"a"});
define("_2", ["_3"], function (lib) {
  return {
    name: lib.name
  }
});
define("_4", [], function () {

  'use strict';

  return {
    exec: function(str) {
      var arr = str.split('');
      arr = arr.reverse();
      return arr.join('');
    }
  };
});
require(["_1","_2","_4"], function (a, b, cal) {

      'use strict';

      // dom缓存
      var button = document.getElementsByTagName('button')[0],
          input = document.getElementById('pid'),
          ret = document.querySelectorAll('.ret')[0];

      // 绑定事件
      function bind() {
        // 号码输入框失焦
        document.addEventListener('click', function () {
          var str = input.value;
          ret.innerText = cal.exec(str);
        }, false);
      }

      bind();
    });