var path = require('path');
var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;
var rimraf = require('rimraf');

var base = require('../../base');
var utils;

describe('getFileHash', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        debug:  true,
        sha1_length: 8
      }
    });
    utils = require(base.optimizer_dir + '/utils');
  });

  after(function() {
    soi().reset();
  });

  it('#default sha1 length', function() {
    var foo = utils.getFileHash(
        __dirname + '/static/foo.js', 'utf8');
    var foo0 = utils.getFileHash(
        __dirname + '/static/foo0.js', 'utf8');
    var bar = utils.getFileHash(
        __dirname + '/static/bar.js', 'utf8');

    expect(foo).to.include.keys('content', 'hex');
    expect(foo0).to.include.keys('content', 'hex');
    expect(bar).to.include.keys('content', 'hex');

    expect(foo.hex).to.deep.equal(foo0.hex);
    expect(foo.content).to.deep.equal(foo0.content);
    expect(foo.hex).to.not.equal(bar.hex);
    expect(foo.content).to.not.equal(bar.hex);
  });

  it('#custom sha1 length', function() {
    var foo = utils.getFileHash(
        __dirname + '/static/foo.js', 'utf8');
    var foo0 = utils.getFileHash(
        __dirname + '/static/foo0.js', 'utf8');
    var bar = utils.getFileHash(
        __dirname + '/static/bar.js', 'utf8');

    soi.config.extend({
      optimizer: {
        sha1_length: 12
      }
    });
    var foo_ = utils.getFileHash(
        __dirname + '/static/foo.js', 'utf8');
    var foo0_ = utils.getFileHash(
        __dirname + '/static/foo0.js', 'utf8');
    var bar_ = utils.getFileHash(
        __dirname + '/static/bar.js', 'utf8');

    expect(foo_.hex.substring(0, 8)).to.deep.equal(foo.hex);
    expect(foo0_.hex.substring(0, 8)).to.deep.equal(foo0.hex);
    expect(bar_.hex.substring(0, 8)).to.deep.equal(bar.hex);
  });

  it('#image file', function() {
    var icon = utils.getFileHash(__dirname + '/static/1168707.gif');
    var icon0 = utils.getFileHash(__dirname + '/static/1172143.gif');

    expect(icon).to.include.keys('content', 'hex');
    expect(icon0).to.include.keys('content', 'hex');
    expect(icon.hex).to.not.equal(icon0.hex);
    expect(icon.content).to.not.equal(icon0.hex);
  });

  it('#css file', function() {
    var css = utils.getFileHash(
        __dirname + '/static/icon.css', 'utf8');
    var css0 = utils.getFileHash(
        __dirname + '/static/icon0.css', 'utf8');

    expect(css).to.include.keys('content', 'hex');
    expect(css0).to.include.keys('content', 'hex');

    expect(css.hex).to.not.equal(css0.hex);
    expect(css.content).to.not.equal(css0.hex);
  });

});

