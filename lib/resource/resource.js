
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

// constructor
function Resource(config) {
    this.type = config.type;
    this.path = config.path;
    this.encoding = config.encoding;
    this.dist_dir = config.dist;

    this.create();
}

// override default toString method
Resource.prototype.toString = function() {

};

// According to config file, generate dist file;
Resource.prototype.create = function() {
    var shasum1 = crypto.createHash('sha1');
    var ctn = fs.readFileSync(this.path, { encoding: this.encoding});

    shasum1.update(ctn);
    var d = shasum1.digest('hex');

    var ext = path.extname(this.path);
    var fname = path.basename(this.path, ext);
    var p = this.dist_dir + '/' + this.type + '/' + fname + '_' + d + ext;

    fs.writeFileSync(p, ctn, { encoding: this.encoding });

};

Resource.clear = function() {

};

Resource.create = function(config) {
    return new Resource(config);
};


module.exports = Resource;