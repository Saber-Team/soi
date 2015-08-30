define("_0",[],function(){return{name:"lib"}});
define("_1",[],{name:"a"});
define("_5",["require","exports","module","_0"],function(e,n,r){var t=e("_0"),i=kerneljs.url("/soi/samples/release/build/online/static/swf/ZeroClipboard.swf");r.exports={name:t.name,url:i}});
define("_3",[],function(){"use strict";return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["_1","_5","_3"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(kerneljs.url("/soi/samples/release/build/online/static/img/Zx6u2uSOV.png"),document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});