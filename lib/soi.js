// 3rd party
var chalk = require('chalk');
var utils = require('./utils');

//==================================
// Usage: e.g.
//   soi()
//     .use(linter)
//     .use(optimizer)
//     .use(reporter)
//     .go();
//==================================

// Global instance
var soi_instance;

// Factory
function createInstance() {
  // null object
  soi_instance = Object.create(null);

  // properties
  Object.defineProperties(soi_instance, {
    'use': {
      // plugins sequence are important
      value: function (plugin) {
        if (typeof plugin !== 'function') {
          console.log(chalk.bgRed.bold('soi plugin must be a function'));
        }
        this.plugins.push({
          plugin: plugin,
          isUsed: true
        });
        return soi_instance;
      },
      enumerable: true
    },
    'drop': {
      // drop specified plugin
      value: function(plugin) {
        if (typeof plugin !== 'function') {
          console.log(chalk.bgRed.bold('soi plugin must be a function'));
        }
        var len = this.plugins.length;
        for (var i = 0; i < len; i++) {
          if (this.plugins[i].isUsed && this.plugins[i].plugin === plugin) {
            this.plugins[i].isUsed = false;
            break;
          }
        }
        return soi_instance;
      },
      enumerable: true
    },
    'go': {
      // start logic
      value: function() {
        // cache length execution
        this.plugins.forEach(function(plugin) {
          if (plugin.isUsed) {
            plugin.plugin.call(soi_instance, this.ENV.config);
          }
        }, this);
      },
      enumerable: true
    },
    // clear global soi
    // used for test case
    'reset': {
      value: function() {
        this.plugins.length = 0;
        this.ENV = null;
        soi_instance = null;
      },
      enumerable: true
    },
    // plugins
    'plugins': {
      value: [],
      writable: true,
      enumerable: true
    },
    // self configuration
    'ENV': {
      value: Object.create(null),
      writable: true,
      enumerable: true
    }
  });

  soi_instance.ENV.config = Object.create(null);

  return soi_instance;
}

var soi = function () {
  if (soi_instance) {
    return soi_instance;
  }
  soi_instance = createInstance();
  return soi_instance;
};

soi.config = Object.create(null);
Object.defineProperties(soi.config, {
  'extend': {
    value:function(config) {
      // multiple plugins
      for (var key in config) {
        try {
          if (Object.prototype.hasOwnProperty.call(config, key)) {
            // override
            var oldConfigItem = soi().ENV.config[key] || Object.create(null);
            utils.extend(oldConfigItem, config[key], true);
            soi().ENV.config[key] = oldConfigItem;
          }
        } catch (ex) {
          console.log(chalk.bgRed.bold('Trying to merge ' + key +
            ' into config options it failed. \n  ' + ex.message));
          process.exit(1);
        }
      }
    },
    enumerable: true
  }
});

// global exports
module.exports = global.soi = soi;