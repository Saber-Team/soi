/** Oslo JavaScript Framework. */
define(["../util/util","../events/util","../events/target","../events/eventtype","./event"],function(a,b,c,d,e){"use strict";function f(a,e){if(c.call(this),f.isSupported(a))throw"HTML5 history is not supported.";this.window_=a||window,this.transformer_=e||null,b.listen(this.window_,d.POPSTATE,this.onHistoryEvent_,!1,this),b.listen(this.window_,d.HASHCHANGE,this.onHistoryEvent_,!1,this)}return a.inherits(f,c),f.isSupported=function(a){var b=a||window;return!(!b.history||!b.history.pushState)},f.prototype.enabled_=!1,f.prototype.useFragment_=!0,f.prototype.pathPrefix_="/",f.prototype.setEnabled=function(a){a!==this.enabled_&&(this.enabled_=a,a&&this.dispatchEvent(new e(this.getToken(),!1)))},f.prototype.getToken=function(){if(this.useFragment_){var a=this.window_.location.href,b=a.indexOf("#");return 0>b?"":a.substring(b+1)}return this.transformer_?this.transformer_.retrieveToken(this.pathPrefix_,this.window_.location):this.window_.location.pathname.substr(this.pathPrefix_.length)},f.prototype.setToken=function(a,b){a!==this.getToken()&&(this.window_.history.pushState(null,b||this.window_.document.title||"",this.getUrl_(a)),this.dispatchEvent(new e(a,!1)))},f.prototype.replaceToken=function(a,b){this.window_.history.replaceState(null,b||this.window_.document.title||"",this.getUrl_(a)),this.dispatchEvent(new e(a,!1))},f.prototype.disposeInternal=function(){b.unlisten(this.window_,d.POPSTATE,this.onHistoryEvent_,!1,this),this.useFragment_&&b.unlisten(this.window_,d.HASHCHANGE,this.onHistoryEvent_,!1,this)},f.prototype.setUseFragment=function(a){this.useFragment_!==a&&(a?b.listen(this.window_,d.HASHCHANGE,this.onHistoryEvent_,!1,this):b.unlisten(this.window_,d.HASHCHANGE,this.onHistoryEvent_,!1,this),this.useFragment_=a)},f.prototype.setPathPrefix=function(a){this.pathPrefix_=a},f.prototype.getPathPrefix=function(){return this.pathPrefix_},f.prototype.getUrl_=function(a){return this.useFragment_?"#"+a:this.transformer_?this.transformer_.createUrl(a,this.pathPrefix_,this.window_.location):this.pathPrefix_+a+this.window_.location.search},f.prototype.onHistoryEvent_=function(){this.enabled_&&this.dispatchEvent(new e(this.getToken(),!0))},f.TokenTransformer=function(){},f.TokenTransformer.prototype.retrieveToken=function(){},f.TokenTransformer.prototype.createUrl=function(){},f});