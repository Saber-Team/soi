module.exports = {
    // background: url("../img/a.png")
    RE_URL                  : /(?:\s*)url\((?:"?)(?:\s*)([^\)\"]*)(?:\s*)(?:"?)\)(?:\s*)/,
    // filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src='top.png');
    RE_SRC                  : /src=(?:(?:"|')?)(?:\s*)([^\)\"\']*)(?:\s*)(?:(?:"|')?)/,
    // background: url("../img/a.png"), url("../img/a.png");
    RE_MULTI_BACKGROUND_URL : new RegExp(),
    // behavior: url(ul.htc) url(hilite.htc);
    RE_MULTI_BEHAVIOR_URL   : new RegExp(),
    // background: url("../img/a.png");
    BACKGROUND_IMAGE        : /^(_|\*)?(-(o|webkit|ms|moz)-)?background(-image)?$/,
    // background: url("../img/a.png"), url("../img/a.png");
    MULTI_BACKGROUND_IMAGE  : /^background$/,
    // border-image: url(../img/a.png) 30 30 round;
    // border-image-source: url(../img/a.png);
    BORDER_IMAGE            : /^(-(o|webkit|ms|moz)-)?border-image(?:\-source)?$/,
    // behavior: url(ul.htc) url(hilite.htc)
    // see: `http://www.w3chtml.com/css3/properties/only-ie/behavior.html`
    BEHAVIOR                : /behavior/,
    // -ms-filter: 'progid:DXImageTransform.Microsoft.MotionBlur(strength=50), progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
    // filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src='top.png');
    FILTER                  : /^(_|\*|\-ms\-)?filter$/,
    //'@import url(backgroundImage.css)';
    IMPORT_PATH             : /import/
};

