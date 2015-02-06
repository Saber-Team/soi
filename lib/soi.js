'use strict';

// 3rd party
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var utils = require('./utils');
var Plugin = require('./plugin');

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
      value: function(plugin) {
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
    // used or dropped plugins
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

// global soi function
var soi = function() {
  if (soi_instance) {
    return soi_instance;
  }
  soi_instance = createInstance();
  return soi_instance;
};

// provide method to manipulate soi config object
soi.config = Object.create(null);
Object.defineProperties(soi.config, {
  'extend': {
    value: function(config) {
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

// helper functions
soi.utils = Object.create(null);
Object.defineProperties(soi.utils, {
  'deepClone': {
    value: utils.deepClone,
    enumerable: true
  },
  'extend': {
    value: utils.extend,
    enumerable: true
  },
  'isDirectory': {
    value: utils.isDirectory,
    enumerable: true
  },
  'isFile': {
    value: utils.isFile,
    enumerable: true
  },
  'isArray': {
    value: utils.isArray,
    enumerable: true
  },
  'isObject': {
    value: utils.isObject,
    enumerable: true
  },
  'unique': {
    value: utils.unique,
    enumerable: true
  },
  'isAbsUrl': {
    value: utils.isAbsUrl,
    enumerable: true
  },
  'normalizeSysPath': {
    value: utils.normalizeSysPath,
    enumerable: true
  },
  'mkdir': {
    value: utils.mkdir,
    enumerable: true
  },
  'readFile': {
    value: utils.readFile,
    enumerable: true
  },
  'writeFile': {
    value: utils.writeFile,
    enumerable: true
  },
  'flatten': {
    value: utils.flatten,
    enumerable: true
  },
  'readJSON': {
    value: utils.readJSON,
    enumerable: true
  }
});

// const variables
soi.const = Object.create(null);
Object.defineProperties(soi.const, {
  'nullFunction': {
    value: function() {},
    enumerable: true
  },
  'version': {
    value: require('../package.json').version,
    enumerable: true
  }
});

// soi plugins registry
soi.globalPlugins = Object.create(null);

/**
 * helper functions for plugins
 * @param {string} name
 * @param {function(config:Object)} plugin
 * @param {?Object} options
 */
soi.registerPlugin = function(name, plugin, options) {
  var plugins = soi.globalPlugins;
  if (plugins) {
    if (typeof name !== 'string') {
      console.log(chalk.bgRed.bold(
          'soi.registerPlugin must accept ' +
          'plugin name as a string.'
      ));
      process.exit(1);
    }
    if (typeof plugin !== 'function') {
      console.log(chalk.bgRed.bold(
          'soi.registerPlugin must accept ' +
          'plugin self as a function.'
      ));
      process.exit(1);
    }
    if (plugins[name]) {
      console.log(chalk.bgRed.bold(
          'soi.globalPlugins already have ' +
          'plugin named ' + name + '.'
      ));
      process.exit(1);
    }
    soi.globalPlugins[name] = new Plugin({
      name: name,
      entry: plugin,
      meta: options
    });
  }
};

/**
 * Load tasks and handlers from a given locally-installed Npm module
 * (installed relative to the base dir).
 * @param {String} name
 */
soi.loadPlugin = function(name) {
  console.log('"' + name + '" local soi plugin');

  var root = path.resolve('node_modules');
  var pkgfile = path.join(root, name, 'package.json');
  var pkg = fs.existsSync(pkgfile) ? utils.readJSON(pkgfile) : {keywords: []};

  // Process plugins.
  var tasksdir = path.join(root, name, 'lib');
  if (fs.existsSync(tasksdir)) {
    loadTasks(tasksdir);
  } else {
    console.log(chalk.bgRed.bold('Local Npm module "' +
      name + '" not found. Is it installed?'));
    process.exit(1);
  }
};

// global exports
module.exports = global.soi = soi;