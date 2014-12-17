// Build-In
var path = require('path');
var fs = require('fs');

// Custom
var utils = require('../utils');
var constants = require('../constants');


/**
 * @constructor
 */
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
    return 'This Resource instance is a ' + this.type + ' resource.' +
        '\nIts real path is ' + this.path + ', to be resolved in encoding ' +
        this.encoding + '.' + '\n';
};


// According to config file, generate dist file;
Resource.prototype.create = function() {
    switch (this.type) {
        case 'js':
            this.__createJsResource__();
            break;
        case 'img':
            this.__createImgResource__();
            break;
        case 'css':
            this.__createCssResource__();
            break;
        case 'svg':
            break;
        case 'fonts':
            break;
        case 'swf':
            break;
    }

};


// helper private function
Resource.prototype.__createJsResource__ = function() {
    /*
    var ret = utils.getFileHash(this.path, this.encoding);
    var dir = path.dirname(this.path);
    var ext = path.extname(this.path);
    var fname = path.basename(this.path, ext);
    var distDir = this.distDir + '/' + this.type + '/';
    // calculate the relative position of two dirs
    distDir = path.resolve(distDir, path.relative(this.origin, dir));

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    var p = distDir + '/' + fname + '_' + ret.hex + ext;
    // fs.writeFileSync(p, ctn, { encoding: this.encoding });
    fs.writeFileSync(p, ret.content);*/
};


// helper private function
Resource.prototype.__createCssResource__ = function() {
    /*
     var ret = utils.getFileHash(this.path, this.encoding);
     var dir = path.dirname(this.path);
     var ext = path.extname(this.path);
     var fname = path.basename(this.path, ext);
     var distDir = this.distDir + '/' + this.type + '/';
     // calculate the relative position of two dirs
     distDir = path.resolve(distDir, path.relative(this.origin, dir));

     if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
     }

     var p = distDir + '/' + fname + constants.BUILD_FILENAME_CONNECTOR + ret.hex + ext;
     fs.writeFileSync(p, ret.content, { encoding: this.encoding });*/
};


// helper private function
Resource.prototype.__createImgResource__ = function() {
    var ret = utils.getFileHash(this.path, null);
    var dir = path.dirname(this.path);
    var ext = path.extname(this.path);
    var fname = path.basename(this.path, ext);
    var distDir = this.distDir + '/' + this.type + '/';
    // calculate the relative position of two dirs
    distDir = path.resolve(distDir, path.relative(this.origin, dir));

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }

    var p = distDir + '/' + fname + constants.BUILD_FILENAME_CONNECTOR + ret.hex + ext;
    // fs.writeFileSync(p, ctn, { encoding: this.encoding });
    fs.writeFileSync(p, ret.content);
};


// static method to create resource instance
Resource.create = function(config) {
    return new Resource(config);
};


// export
module.exports = Resource;