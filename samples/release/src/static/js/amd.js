/**
 * @fileoverview
 * @author Leo.Zhang(zmike86)
 */

require(['./mod_A', './mod_B', './mod_C'],
    function (a, b, cal) {

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
    }
);