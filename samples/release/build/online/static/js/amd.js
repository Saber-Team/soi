define("0Cmb+",[],function(){return{name:"lib"}});
define("p+hVr",[],{name:"a"});
define("tgyw4",["0Cmb+"],function(lib){var url=kerneljs.url("/soi/samples/release/build/online/static/swf/ZeroClipboard.swf");return{name:lib.name,url:url}});
define("iBXC1",[],function(){"use strict";var API="http://zhida.baidu.com:8080";return{exec:function(str){var arr=str.split("");arr=arr.reverse();return arr.join("")}}});
require(["p+hVr","tgyw4","iBXC1"],function(a,b,cal){"use strict";var button=document.getElementsByTagName("button")[0],input=document.getElementById("pid"),ret=document.querySelectorAll(".ret")[0];function bind(){document.addEventListener("click",function(){var str=input.value;ret.innerText=cal.exec(str)},false)}bind()});