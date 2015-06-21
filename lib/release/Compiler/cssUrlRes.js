'use strict';

// Below is value
// background: url("../img/a.png");
// background: url("../img/a.png"), url("../img/a.png");
// behavior: url(ul.htc) url(hilite.htc);
// @font-face {
//   font-family: "my-style";
//   src: url('a.eof'),
//     url('a.ttf'),
//     url('a.woff');
// }
var RE_URL = /(?:\s*)url\((?:(?:"|')?)(?:\s*)([^\)\"\']*)(?:\s*)(?:(?:"|')?)\)(?:\s*)/,
// filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src='top.png');
  RE_SRC = /src=(?:(?:"|')?)(?:\s*)([^\)\"\']*)(?:\s*)(?:(?:"|')?)/,
//'@import url(a.css)';
//'@import "a.css";
  RE_IMPORT_URL = /(?:\s*)(?:url\("?|")(?:\s*)([^\)\"]*)(?:\s*)(?:"|"?\))(?:\s*)/,


// Below is css property
// background: url("../img/a.png");
  BACKGROUND_IMAGE = /^(_|\*)?(-(o|webkit|ms|moz)-)?background(-image)?$/,
// background: url("../img/a.png"), url("../img/a.png");
  MULTI_BACKGROUND_IMAGE = /^background$/,
// border-image: url(../img/a.png) 30 30 round;
// border-image-source: url(../img/a.png);
  BORDER_IMAGE = /^(-(o|webkit|ms|moz)-)?border-image(?:\-source)?$/,
// behavior: url(ul.htc) url(hilite.htc)
// see: `http://www.w3chtml.com/css3/properties/only-ie/behavior.html`
  BEHAVIOR = /^(_|\*)?behavior$/,
// -ms-filter: 'progid:DXImageTransform.Microsoft.MotionBlur(strength=50), progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
// filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src='top.png');
  FILTER = /^(_|\*|\-ms\-)?filter$/,
//'@import url(backgroundImage.css)';
  IMPORT_PATH = /import/;


module.exports = {
  RE_URL: RE_URL,
  RE_IMPORT_URL: RE_IMPORT_URL,
  RE_SRC: RE_SRC,
  BACKGROUND_IMAGE: BACKGROUND_IMAGE,
  MULTI_BACKGROUND_IMAGE: MULTI_BACKGROUND_IMAGE,
  BORDER_IMAGE: BORDER_IMAGE,
  BEHAVIOR: BEHAVIOR,
  FILTER: FILTER,
  IMPORT_PATH: IMPORT_PATH,
  getBgImages: function(val) {
    var parts = val.split(',');
    var ret = [];
    parts.forEach(function(part) {
      var r = part.match(RE_URL);
      if (r && r[1]) {
        ret.push(r[1]);
      }
    });
    return ret;
  },
  getFilters: function(val) {
    var ret = [];
    var r = val.match(RE_SRC);
    if (r && r[1]) {
      ret.push(r[1]);
    }
    return ret;
  },
  getHTCs: function(val) {
    var parts = val.split(/\s+/);
    var ret = [];
    parts.forEach(function(part) {
      var r = part.match(RE_URL);
      if (r && r[1]) {
        ret.push(r[1]);
      }
    });
    return ret;
  },
  getImportUrl: function(val) {
    var ret = [];
    var r = val.match(RE_IMPORT_URL);
    if (r && r[1]) {
      ret.push(r[1]);
    }
    return ret;
  },
  getWebFonts: function(val) {
    var parts = val.split(/,/);
    var ret = [];
    parts.forEach(function(part) {
      var r = part.match(RE_URL);
      if (r && r[1]) {
        ret.push(r[1]);
      }
    });
    return ret;
  }
};