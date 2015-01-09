// Custom
var utils = require('../utils');
var StaticProcessor = require('./staticprocessor');

/**
 * Class deal with image resource
 * @constructor
 * @implements {Processor}
 */
var HtcProcessor = function() {
  this.type = 'htc';
  StaticProcessor.call(this);
};

utils.inherits(HtcProcessor, StaticProcessor);

module.exports = HtcProcessor;