__d("AQJGK",[],function(e,t,n,i){"use strict";i.identity="moduleA",i.fulfill=!1});
__d("zMZ2x",["AQJGK"],function(e,t,n,i){"use strict";var r=t("AQJGK");i.getModuleA=function(){return new r}});
__d("T4EMD",["zMZ2x"],function(e,t,n,i){"use strict";t("zMZ2x");n.exports={name:"C"}});
"use strict";function fn(){require.async(["tospe"],function(e){e.isPast()})}var moduleA=require("AQJGK"),moduleB=require("zMZ2x"),moduleC=require("T4EMD"),$btn=document.querySelector("button");document.addEventListener($btn,"click",fn);
__d("tospe",[],function(e,t,n,i){"use strict";i.isPast=function(){return Boolean('<%$_REQUEST["token"]%>')}});
