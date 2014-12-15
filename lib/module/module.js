
/**
 * Represent a single module.
 * @constructor
 */
function Module() {
    this.id;
    this.path;
    this.deps;
    this.status;
    this.exports;
}


Module.STATUS = {
    INIT    : 0,
    RESOLVED: 3
};


module.exports = Module;