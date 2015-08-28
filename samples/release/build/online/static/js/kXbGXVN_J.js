define("_0",[],{name:"a"});
define("_1",[],function(e,n,r){var a=e("../vendor/lib"),i=kerneljs.url("/online/static/swf/ZeroClipboard.swf");n.exports={name:a.name,url:i}});
define("_2",[],function(){return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["_0","_1","_2"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});