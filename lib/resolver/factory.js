var ScriptResolver = require('./js');
var StyleResolver = require('./css');


function ResolverFactory() {

}


ResolverFactory.getInstance = function(type) {
    switch (type) {
        case 'image':
            break;
        case 'js':
            return new ScriptResolver();
            break;
        case 'css':
            return new StyleResolver();
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