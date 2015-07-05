define("_3",[],function(){return{name:"lib"}});
define("_1",[],{name:"a"});
define("_2",["_3"],function(n){return{name:n.name}});
define("_4",[],function(){"use strict";return{exec:function(e){var n=e.split("");return n=n.reverse(),n.join("")}}});
require(["_1","_2","_4"],function(e,n,t){"use strict";function r(){document.addEventListener("click",function(){var e=i.value;u.innerText=t.exec(e)},!1)}var i=(document.getElementsByTagName("button")[0],document.getElementById("pid")),u=document.querySelectorAll(".ret")[0];r()});