define("_3",[],function(){return{name:"lib"}});
define("_1",[],{name:"a"});
define("_2",["_3"],function(e){return{name:e.name}});
require(["_1","_2"],function(e,n){console.log(e.name)});