
var fs = require('fs');


// var path = require('path');
// var resolve = path.resolve;

// var whitespace = '  ';
// var pre = '';


/**
 * @constructor
 */
function Walker(config) {
    // The dir depth from start dir(default to 0)
    this.depth = 0;
    // directory need to walk
    this.startDir = config.dirname;
    // track current directory
    // used by joined with '/'
    this.curDir = [config.dirname];
    // do sth important
    this.callback = null;
}


// do the track
Walker.prototype.doTrack = function(file) {
    // pre = '';
    // for(var i = 0; i < this.depth; i++) {
    //     pre += whitespace;
    // }
    // console.info(pre + file + '/');
};


// helper function used by process method
Walker.prototype.loop = function(file, index, files) {
    // console.log('read: ' + file);
    var isLastItem = (index === files.length - 1);
    var stat = fs.lstatSync(this.curDir.join('/') + '/' + file);
    if (stat.isDirectory()) {
        // do the track
        this.doTrack(file);

        this.depth++;
        this.curDir.push(file);
        var dir = this.curDir.join('/') + '/';

        this.process(fs.readdirSync(dir));
        if (isLastItem) {
            this.depth--;
            this.curDir.pop();
        }

    } else if (stat.isFile()) {
        // do the track
        this.doTrack(file);

        // todo do sth important
        this.callback(this.curDir.join('/') + '/', file);
        if (isLastItem) {
            this.depth--;
            this.curDir.pop();
        }
    }
};


// traverse the given directory
Walker.prototype.process = function(files) {
    if (!files || files.length === 0)
        return;
    files.forEach(this.loop, this);
};


// go
Walker.prototype.walk = function (callback) {
    this.callback = callback;
    var files = fs.readdirSync(this.startDir);
    this.process(files);
};


// export
module.exports = Walker;