'use strict';

/**
 * Plugin Wrapper Class
 * @param {Object} config
 * @constructor
 */
function Plugin(config) {
  this.name = config.name;
  // plugin main function
  this.entry = config.entry;
  // meta information
  this.meta = config.meta;
  // each plugin normally responded to a command
  // such as 'soi optimize' provide a command 'optimize'
  // to load 'soi-optimizer' plugin dynamically.
  this.cmd = this.meta.cmd || '';
  // plugin names current plugin depend on.
  // e.g. [ 'soi-linter', 'soi-template' ]
  this.requires = this.meta.requires || [];
}

module.exports = Plugin;