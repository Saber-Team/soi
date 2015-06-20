// Custom
var utils = require('../utils');
var StaticProcessor = require('./staticprocessor');

/**
 * Class deal with image resource
 * @constructor
 * @implements {Processor}
 */
var ImageProcessor = function() {
  this.type = 'img';
  StaticProcessor.call(this);
};

utils.inherits(ImageProcessor, StaticProcessor);

module.exports = ImageProcessor;