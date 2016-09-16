__d("tospe",[],function(t,n,e,u){"use strict";u.isPast=function(){return Boolean('<%$_REQUEST["token"]%>')}});
__d("AQJGK",[],function(i,t,l,u){"use strict";u.identity="moduleA",u.fulfill=!1});
__d("zMZ2x",["AQJGK"],function(t,u,n,i){"use strict";var e=u("AQJGK");i.getModuleA=function(){return new e}});
__d("T4EMD",["zMZ2x"],function(t,n,u,e){"use strict";n("zMZ2x");u.exports={name:"C"}});
"use strict";function fn(){require.async(["tospe"],function(t){t.isPast()})}var moduleA=require("AQJGK"),moduleB=require("zMZ2x"),moduleC=require("T4EMD"),$btn=document.querySelector("button");document.addEventListener($btn,"click",fn);
