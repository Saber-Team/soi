// Custom
var utils = require('../utils');
var StaticResource = require('./staticresource');

/**
 * Class represents for single Image resource.
 * @constructor
 */
function ImageResource(config) {
  this.type = 'img';
  StaticResource.call(this, config);
  this.create();
}

util.inherits(ImageResource, StaticResource);

// export
module.exports = ImageResource;