// Class needed
var ImageProcessor = require('./image');
var FontProcessor = require('./font');
var HtcProcessor = require('./htc');
var SwfProcessor = require('./swf');
var SvgProcessor = require('./svg');
var ScriptProcessor = require('./js');
var StyleProcessor = require('./css');

function ProcesssorFactory() {}

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
      return new FontProcessor();
      break;
    case 'swf':
      return new SwfProcessor();
      break;
    case 'htc':
      return new HtcProcessor();
      break;
    default :
      throw 'Processor type: ' + type + ' is not supported.';
      break;
  }
};

module.exports = ProcesssorFactory;