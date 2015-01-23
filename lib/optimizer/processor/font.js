// Custom
var utils = require('../utils');
var StaticProcessor = require('./staticprocessor');

/**
 * Class deal with web-font resource
 * @constructor
 * @implements {Processor}
 */
var FontProcessor = function() {
  this.type = 'font';
  StaticProcessor.call(this);
};

utils.inherits(FontProcessor, StaticProcessor);

module.exports = FontProcessor;