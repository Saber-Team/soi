define("_0",[],function(){return{name:"lib"}});
define("_1",[],{name:"a"});
define("_2",["_0"],function(e){var n=kerneljs.url("../swf/ZeroClipboard.swf");return{name:e.name,url:n}});
define("_3",[],function(){return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["_1","_2","_3"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=u.value;i.innerText=t.exec(e)},!1)}var u=(document.getElementsByTagName("button")[0],document.getElementById("pid")),i=document.querySelectorAll(".ret")[0];r()});