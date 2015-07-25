define("/static/vendor/lib.js",[],function(){return{name:"lib"}});
define("/static/js/a.js",[],{name:"a"});
define("/static/js/b.js",["/static/vendor/lib.js"],function(e){return{name:e.name}});
define("/static/js/index.js",["/static/js/a.js","/static/js/b.js"],function(e,t){console.log(e.name)});