// Custom
var utils = require('../utils');
var StaticProcessor = require('./staticprocessor');

/**
 * Class deal with image resource
 * @constructor
 * @implements {Processor}
 */
var SwfProcessor = function() {
  this.type = 'swf';
  StaticProcessor.call(this);
};

utils.inherits(SwfProcessor, StaticProcessor);

module.exports = SwfProcessor;