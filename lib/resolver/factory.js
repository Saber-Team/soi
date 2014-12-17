var ScriptResolver = require('./js');
var StyleResolver = require('./css');


function ResolverFactory() {

}


ResolverFactory.getInstance = function(type, soi_config) {
    switch (type) {
        case 'image':
            break;
        case 'js':
            return new ScriptResolver(soi_config);
            break;
        case 'css':
            return new StyleResolver(soi_config);
            break;
        case 'font':
            break;
        case 'svg':
            break;
        case 'swf':
            break;
    }
};


module.exports = ResolverFactory;