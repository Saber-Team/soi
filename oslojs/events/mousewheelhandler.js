/** Oslo JavaScript Framework. */
define(["../util/util","../dom/util","./util","./browserevent","./target","../math/util","../style/util","../ua/util","./mousewheelevent"],function(a,b,c,d,e,f,g,h,i){"use strict";var j=function(a,b){return h.isWEBKIT&&(h.isMAC||h.isLINUX)&&0!==a%b?a:a/b},k=function(a,d){e.call(this),this.element_=a;var f=b.isElement(this.element_)?this.element_:this.element_?this.element_.body:null;this.isRtl_=!!f&&g.isRightToLeft(f);var i=h.isGECKO?"DOMMouseScroll":"mousewheel";this.listenKey_=c.listen(this.element_,i,this,d)};return a.inherits(k,e),k.prototype.maxDeltaX_=null,k.prototype.maxDeltaY_=null,k.prototype.setMaxDeltaX=function(a){this.maxDeltaX_=a},k.prototype.setMaxDeltaY=function(a){this.maxDeltaY_=a},k.prototype.handleEvent=function(b){var c=0,d=0,e=0,g=b.getBrowserEvent();if("mousewheel"===g.type){var k=1;(h.isIE||h.isWEBKIT&&(h.isWINDOWS||h.isVersionOrHigher("532.0")))&&(k=40),e=j(-g.wheelDelta,k),a.isNull(g.wheelDeltaX)?d=e:(c=j(-g.wheelDeltaX,k),d=j(-g.wheelDeltaY,k))}else e=g.detail,e>100?e=3:-100>e&&(e=-3),a.isNull(g.axis)||g.axis!==g.HORIZONTAL_AXIS?d=e:c=e;a.isNumber(this.maxDeltaX_)&&(c=f.clamp(c,-this.maxDeltaX_,this.maxDeltaX_)),a.isNumber(this.maxDeltaY_)&&(d=f.clamp(d,-this.maxDeltaY_,this.maxDeltaY_)),this.isRtl_&&(c=-c);var l=new i(e,g,c,d);this.dispatchEvent(l)},k.prototype.disposeInternal=function(){k.superClass_.disposeInternal.call(this),c.unlistenByKey(this.listenKey_),this.listenKey_=null},k});