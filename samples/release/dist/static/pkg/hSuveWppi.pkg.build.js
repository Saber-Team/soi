__d("src/app/vrcode.js",function(n,o,e){o.isPast=function(){return Boolean('<%$_REQUEST["token"]%>')}});
__d("src/app/moduleA.js",function(l,d,i){d.identity="moduleA",d.fulfill=!1});
__d("src/app/moduleB.js",function(u,e,n){var l=u("src/app/moduleA.js");e.getModuleA=function(){return new l}});
__d("src/app/moduleC.js",function(u,e,n){u("src/app/moduleB.js");n.exports={name:"C"}});
kerneljs.exec("app",function(e,n,o){function s(){e.async(["src/app/vrcode.js"],function(e){e.isPast()})}var c=(e("src/app/moduleA.js"),e("src/app/moduleB.js"),e("src/app/moduleC.js"),document.querySelector("button"));document.addEventListener(c,"click",s)});
