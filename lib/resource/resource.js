
var path = require('path');
var fs = require('fs');
var crypto = require('crypto');


// constructor
function Resource(config) {
    this.origin = config.origin;
    this.type = config.type;
    this.path = config.path;
    this.encoding = config.encoding;
    this.distDir = config.dist;

    this.create();
}


// override default toString method
Resource.prototype.toString = function() {

};


// According to config file, generate dist file;
Resource.prototype.create = function() {
    var shasum1 = crypto.createHash('sha1');
    // var ctn = fs.readFileSync(this.path, { encoding: this.encoding});
    var ctn = fs.readFileSync(this.path);

    shasum1.update(ctn);
    var hex = shasum1.digest('hex');

    var dir = path.dirname(this.path);
    var ext = path.extname(this.path);
    var fname = path.basename(this.path, ext);
    var distDir = this.distDir + '/' + this.type + '/';
    // calculate the relative position of two dirs
    distDir = path.resolve(distDir, path.relative(this.origin, dir));

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    var p = distDir + '/' + fname + '_' + hex + ext;
    // fs.writeFileSync(p, ctn, { encoding: this.encoding });
    fs.writeFileSync(p, ctn);
};


// static method to create resource instance
Resource.create = function(config) {
    return new Resource(config);
};


// export
module.exports = Resource;