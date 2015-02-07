'use strict';

// import modules
var path = require('path');
var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var rimraf = require('rimraf');

var base = require('../base');
var utils;

describe('mkdir', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        debug:  true,
        sha1_length: 8
      }
    });
    utils = soi.utils;
  });

  after(function() {
    soi().reset();
    rimraf.sync(path.join(__dirname, 'a/'), function (err) {});
    rimraf.sync(path.join(__dirname, 'b/'), function (err) {});
    rimraf.sync(path.join(__dirname, 'd/'), function (err) {});
  });

  it('#1 depth', function() {
    var file = path.join(__dirname, 'a/x');
    utils.mkdir(file);
    expect(fs.existsSync(file)).to.be.true();
  });

  it('#2 depth', function() {
    var file = path.join(__dirname, 'b/c/x');
    utils.mkdir(file);
    expect(fs.existsSync(file)).to.be.true();
  });

  it('#3 depth', function() {
    var file = path.join(__dirname, 'd/e/f/x');
    utils.mkdir(file);
    expect(fs.existsSync(file)).to.be.true();
  });

});

