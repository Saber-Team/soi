// 3rd party
var chalk = require('chalk');

// Global instance
var soi_instance;


// Factory
function createInstance() {
  // null object
  soi_instance = Object.create(null);

  // sequence is important
  soi_instance.use = function(plugin) {
    if (typeof plugin !== 'function') {
      console.log(chalk.bgRed.bold('soi plugin must be a function'));
    }
    this.plugins.push({
      plugin: plugin,
      isUsed: true
    });
    return soi_instance;
  };

  // drop plugin
  soi_instance.drop = function(plugin) {
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
  };

  // self configuration
  soi_instance.ENV = {
    config: SOI_CONFIG
  };

  // plugins
  soi_instance.plugins = [];

  // start logic
  soi_instance.go = function() {
    // cache length execution
    this.plugins.forEach(function(plugin) {
      if (plugin.isUsed) {
        plugin.plugin.call(soi_instance, this.ENV.config);
      }
    }, this);
  };

  soi_instance.config = {

  };
}

// host generator
function soi() {
  if (soi_instance) {
    return soi_instance;
  }
  soi_instance = createInstance();
  return soi_instance;
}

// global exports
module.exports = global.soi = soi;


//==================================
// e.g.
//   soi()
//     .use(linter)
//     .use(optimizer)
//     .use(reporter)
//     .go();
//==================================