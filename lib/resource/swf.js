// Custom
var utils = require('../utils');
var StaticResource = require('./staticresource');

/**
 * Class represents for single swf resource.
 * @constructor
 */
function SwfResource(config) {
  this.type = 'swf';
  StaticResource.call(this, config);
  this.create();
}

util.inherits(SwfResource, StaticResource);

// export
module.exports = SwfResource;