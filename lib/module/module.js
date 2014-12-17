var util = require('util');
var fs = require('fs');

/**
 * Represent a single module.
 * @constructor
 */
function Module(config) {
    this.id = config.id;
    this.path = '';
    this.deps = config.deps;
    this.factory = config.factory;
    this.status = config.status;
    // this.exports = null;
}


/**
 * set abs path for current file
 * @param {String} path
 */
Module.prototype.setPath = function(path) {
    var exists = fs.existsSync(path);
    if (!exists) {
        util.error('As required module id: ' + this.id + ', ' + path + ' file not exists!');
        return;
    }
    this.path = path;
};


/**
 * @enum
 */
Module.STATUS = {
    INIT    : 0,
    PARSING : 1,
    RESOLVED: 2,
    READY   : 3
};


module.exports = Module;