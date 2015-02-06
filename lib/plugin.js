'use strict';

/**
 * Plugin Class
 * @param {Object} config
 * @constructor
 */
function Plugin(config) {
  this.name = config.name;
  this.entry = config.entry;
  this.meta = config.meta;
  this.inUse = false;
}

module.exports = Plugin;