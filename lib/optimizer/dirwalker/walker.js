// Built-in
var fs = require('fs');
var chalk = require('chalk');

// custom
var utils = require('../utils');
// var path = require('path');
// var resolve = path.resolve;

// var whitespace = '  ';
// var pre = '';


/**
 * Directory walker.
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
  var isD = utils.isDirectory(this.curDir.join('/') + '/' + file),
      isF = utils.isFile(this.curDir.join('/') + '/' + file);
  if (isD) {
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

  } else if (isF) {
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
  if (!files || files.length === 0) {
    return;
  }
  files.forEach(this.loop, this);
};

/**
 * Walk through given directory. For each resource execute callback.
 * @param {Function} callback
 */
Walker.prototype.walk = function (callback) {
  this.callback = callback;
  try {
    var files = fs.readdirSync(this.startDir);
  } catch (ex) {
    console.log(chalk.bgRed.bold(
      'Trying to read directory at: \n  ' + this.startDir + ' failed.\n  ' +
        ex.message + '\n'
    ));
    process.exit(1);
  }
  this.process(files);
};


// export
module.exports = Walker;