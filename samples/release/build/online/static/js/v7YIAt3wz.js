define("/static/vendor/lib.js",[],function(){return{name:"lib"}});
define("/static/js/a.js",[],{name:"a"});
define("/static/js/b.js",["/static/vendor/lib.js"],function(n){return{name:n.name}});
define("/static/js/cal.js",[],function(){return{exec:function(n){var e=n.split("");return e=e.reverse(),e.join("")}}});
define("/static/js/app.js",["/static/js/a.js","/static/js/b.js","/static/js/cal.js"],function(e,t,n){"use strict";function i(){document.addEventListener("click",function(){var e=s.value;c.innerText=n.exec(e)},!1)}var s=(document.getElementsByTagName("button")[0],document.getElementById("pid")),c=document.querySelectorAll(".ret")[0];i()});