var fs = require('fs');
var crypto = require('crypto');

function Resource(config) {
    this.type = config.type;
    this.path = config.path;
    this.create();
}

// override default toString method
Resource.prototype.toString = function() {

};

// According to config file, generate dist file;
Resource.prototype.create = function() {
    var shasum1 = crypto.createHash('sha1');
    var s = fs.ReadStream(this.path);

    

    s.on('data', function(d) {
        shasum1.update(d);
    });
    s.on('end', function() {
        var d = shasum1.digest('hex');
        console.log(d + '  ' + js);
    });
};

Resource.clear = function() {

};

Resource.create = function(config) {
    return new Resource(config);
};


module.exports = Resource;