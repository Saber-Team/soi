define("_0",[],function(){return{name:"lib"}});
define("_1",[],{name:"a"});
define("_2",[require,exports,module,"_0"],function(e,n,r){var i=e("../vendor/lib"),o=kerneljs.url("/online/static/swf/ZeroClipboard.swf");r.exports={name:i.name,url:o}});
define("_3",[],function(){return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["_1","_2","_3"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});