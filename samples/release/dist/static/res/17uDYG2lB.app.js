__d("react-app",["math"],function(t,e,n,r){"use strict";function o(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e["default"]=t,e}Object.defineProperty(r,"__esModule",{value:!0});var u=e("math"),i=o(u);r["default"]=React.createClass({displayName:"unknown",getInitialState:function(){return{num:this.getRandomNumber()+i.sum(1,2,3)}},getRandomNumber:function(){return Math.ceil(6*Math.random())},render:function(){return React.createElement("div",null,"Your dice roll:",this.state.num)}})});