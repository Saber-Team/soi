
var reader = require('./cntReader.js');

function Resource(config) {
    this.type = config.type;
    this.path = config.path;
    this.dist = reader.read(path);
}

Resource.prototype.print = function() {

};

Resource.clear = function() {

};

Resource.create = function(config) {
    return new Resource(config);
};


module.exports = Resource;