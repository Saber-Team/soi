module.exports = {
    // url("../img/a.png")
    RE_URL                  : /(?:[\s]*)url\((?:[\s]*)([^\\)\s]*)(?:[\s]*)(?:[\s]*)\)/,
    // url("../img/a.png"), url("../img/a.png");
    RE_MULTI_URL            : /F/,
    // background: url("../img/a.png");
    BACK_GROUND_IMAGE       : /^(?:\-[o|webkit|ms]\-)?background(?:\-image)?$/,
    // background: url("../img/a.png"), url("../img/a.png");
    MULTI_BACK_GROUND_IMAGE : /^background$/,
    // border-image:url(../img/a.png) 30 30 round;
    BORDER_IMAGE            : /^(?:\-[o|webkit|ms]\-)?border(?:\-image)?$/,
    //'url(backgroundImage.css)';
    IMPORT_PATH             : /import/
};

