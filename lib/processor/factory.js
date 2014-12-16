var ImageProcessor = require('./image');
var ScriptProcessor = require('./js');
var StyleProcessor = require('./css');


function ProcesssorFactory() {

}


ProcesssorFactory.getInstance = function(type, soi_config) {
    switch (type) {
        case 'image':
            return new ImageProcessor(soi_config);
            break;
        case 'js':
            return new ScriptProcessor(soi_config);
            break;
        case 'css':
            return new StyleProcessor(soi_config);
            break;
        case 'font':
            break;
        case 'svg':
            break;
        case 'swf':
            break;
    }
};


module.exports = ProcesssorFactory;