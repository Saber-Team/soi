__d("tospe",function(n,t,e){t.isPast=function(){return Boolean('<%$_REQUEST["token"]%>')}});
__d("AQJGK",function(n,e,t){e.identity="moduleA",e.fulfill=!1});
__d("zMZ2x",function(n,e,t){var u=n("AQJGK");e.getModuleA=function(){return new u}});
__d("T4EMD",function(n,e,t){n("zMZ2x");t.exports={name:"C"}});
kerneljs.exec("app",function(n,t,e){function o(){n.async(["tospe"],function(n){n.isPast()})}var u=(n("AQJGK"),n("zMZ2x"),n("T4EMD"),document.querySelector("button"));document.addEventListener(u,"click",o)});
