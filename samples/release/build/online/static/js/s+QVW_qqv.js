define("0Cmb+",[],function(){return{name:"lib"}});
define("p+hVr",[],{name:"a"});
define("tgyw4",["0Cmb+"],function(e){var n=kerneljs.url("/soi/samples/release/build/online/static/swf/ZeroClipboard.swf");return{name:e.name,url:n}});
define("iBXC1",[],function(){"use strict";return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["p+hVr","tgyw4","iBXC1"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});