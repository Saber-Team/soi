var ImageProcessor = require('./image');
var ScriptProcessor = require('./js');
var StyleProcessor = require('./css');


function ProcesssorFactory() {

}


ProcesssorFactory.getInstance = function(type) {
    switch (type) {
        case 'image':
            return new ImageProcessor();
            break;
        case 'js':
            return new ScriptProcessor();
            break;
        case 'css':
            return new StyleProcessor();
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