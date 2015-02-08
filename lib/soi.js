'use strict';

// import modules
var path = require('path');
var fs = require('fs');
var utils = require('./utils');
var Plugin = require('./plugin');
var log = require('./log');

//==================================
// Usage: e.g.
//   soi()
//     .use('soi-linter')
//     .use('soi-optimizer')
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
          soi.log.error('soi plugin entry point must be a function');
        }
        this.plugins.push({
          entry: plugin,
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
          soi.log.error('soi plugin entry point must be a function');
        }
        var len = this.plugins.length;
        for (var i = 0; i < len; i++) {
          if (this.plugins[i].isUsed && this.plugins[i].entry === plugin) {
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
            plugin.entry.call(soi_instance, this.ENV.config);
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

// provide log functions
soi.log = Object.create(null);
Object.defineProperties(soi.log, {
  'error': {
    value: log.error,
    enumerable: true
  },
  'info': {
    value: log.info,
    enumerable: true
  },
  'ok': {
    value: log.ok,
    enumerable: true
  },
  'warn': {
    value: log.warn,
    enumerable: true
  }
});

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
          soi.log.error('Trying to merge ' + key +
            ' into config options it failed. \n  ' + ex.message);
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
      soi.log.error(
          'soi.registerPlugin must accept ',
          'plugin name as a string.');
      process.exit(1);
    }
    if (typeof plugin !== 'function') {
      soi.log.error(
        'soi.registerPlugin must accept ',
        'plugin self as a function.');
      process.exit(1);
    }
    if (plugins[name]) {
      soi.log.error(
          'soi.globalPlugins already have ',
          'plugin named ', name, '.');
      process.exit(1);
    }
    Object.defineProperty(soi.globalPlugins, name, {
      value: new Plugin({
        name: name,
        entry: plugin,
        meta: options
      }),
      enumerable: true
    });
  }
};

/**
 * helper function for loadPlugin
 * @param {string} filepath
 * @private
 */
function load_(filepath) {
  var filename = path.basename(filepath);
  var msg = 'Loading "' + filename + '" plugin...';
  var fn;
  try {
    // Load taskfile.
    fn = require(path.resolve(filepath));
    if (typeof fn !== 'function') {
      soi.log.error(filepath, ' export plugin must be an function');
      process.exit(1);
    }
    soi.log.ok(msg);
  } catch(e) {
    // Something went wrong.
    soi.log.error(e.message, '\n', e.stack);
  }
}

/**
 * Load plugins from a given locally-installed Npm module
 * (installed relative to the base dir).
 * @param {String} name e.g. "soi-optimizer"
 */
soi.loadPlugin = function(name) {
  soi.log.info('"' + name + '" soi plugin');

  var root = path.resolve('node_modules');
  // Process plugins.
  var pluginpath = path.join(root, name, 'lib/index');
  // console.log(pluginpath);
  var fn;

  if (fs.existsSync(pluginpath)) {
    load_(pluginpath);
  } else {
    try {
      // load as global module
      fn = require(name);
      var msg = 'Loading "' + name + '" plugin...';
      if (typeof fn !== 'function') {
        soi.log.error(name, ' export plugin must be an function');
        process.exit(1);
      }
      soi.log.ok(msg);
    } catch (err) {
      soi.log.error('Local and Global Npm module "', name,
        '" not found. Is it installed?');
      process.exit(1);
    }
  }
};

/**
 * Given command arg and return all plugins it stands for;
 * @param {string} cmd
 * @return {Array.<Function>}
 */
soi.findPluginsByCommand = function(cmd) {
  var plugins = [];
  if (!cmd) {
    return plugins;
  }
  var pluginnames = Object.keys(soi.globalPlugins);
  // retrieve corresponding plugins
  var needs = pluginnames.filter(function(pn) {
    var plugin = soi.globalPlugins[pn];
    if (plugin && plugin.cmd === cmd) {
      return true;
    }
  });
  needs.forEach(function(pn) {
    var plugin = soi.globalPlugins[pn];
    // todo recursion
    plugin.requires.forEach(function(pn) {
      var plugin = soi.globalPlugins[pn];
      plugins.push(plugin.entry);
    });
    plugins.push(plugin.entry);
  });
  return plugins;
};

// global exports
module.exports = global.soi = soi;