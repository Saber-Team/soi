var ScriptResolver = require('./js');
var StyleResolver = require('./css');


function ResolverFactory() {

}


ResolverFactory.getInstance = function(type) {
  switch (type) {
    case 'image':
    case 'font':
    case 'svg':
    case 'swf':
    case 'htc':
      break;
    case 'js':
      return new ScriptResolver();
      break;
    case 'css':
      return new StyleResolver();
      break;
  }
};


module.exports = ResolverFactory;