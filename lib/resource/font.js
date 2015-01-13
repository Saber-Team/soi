// Custom
var utils = require('../utils');
var StaticResource = require('./staticresource');

/**
 * Class represents for single font resource.
 * @constructor
 */
function FontResource(config) {
  this.type = 'font';
  StaticResource.call(this, config);
  this.create();
}

utils.inherits(FontResource, StaticResource);

// export
module.exports = FontResource;