define("yqQTj",[],function(){return{name:"lib"}});
define("le+F+",[],{name:"a"});
define("2mVNX",["yqQTj"],function(e){var n=kerneljs.url("/soi/samples/release/build/online/static/swf/ZeroClipboard.swf");return{name:e.name,url:n}});
define("qmKD7",[],function(){"use strict";return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
define("3wD0g",["le+F+","2mVNX","qmKD7"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});