// Custom
var utils = require('../utils');
var StaticResource = require('./staticresource');

/**
 * Class represents for single htc resource.
 * @constructor
 */
function HtcResource(config) {
  this.type = 'htc';
  StaticResource.call(this, config);
  this.create();
}

util.inherits(HtcResource, StaticResource);

// export
module.exports = HtcResource;