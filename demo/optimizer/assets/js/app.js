/**
 * @fileoverview
 * @author Leo.Zhang(zmike86)
 */

require([
    '../../lib/events/util',
    '../../lib/events/eventType',
    '../../lib/dom/util'
  ],
  function(events, EventType, dom) {

    'use strict';

    // dom缓存
    var button = document.getElementsByTagName('button')[0],
      input = dom.getElement('pid'),
      ret = dom.getElementsByClass('ret')[0];

    // 绑定事件
    function bind() {
      // 号码输入框失焦
      events.listen(button, EventType.CLICK, function () {
        var str = input.value;
        require.async('./cal', function(cal) {
          dom.setTextContent(ret, cal.exec(str));
        });
      }, false);
    }

    bind();
  }
);