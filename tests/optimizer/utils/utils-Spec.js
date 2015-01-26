var path = require('path');
var fs = require('fs');

var chai = require('chai');
var expect = chai.expect;
var utils = require('../../../lib/optimizer/utils');
var rimraf = require('rimraf');

describe('utils test', function() {

  before(function() {
    soi.config.set({
      base_dir : __dirname + '/',
      debug:  true,
      sha1_length: 8
    });
  });

  after(function() {
    global.soi = null;
  });

  it('#extend', function() {
    var obj = Object.create(null);
    var target = {
      name: 123,
      value: 456
    };
    utils.extend(obj, target);

    expect(obj).to.be.an('object');
    expect(obj).to.have.property('name')
      .that.is.a('number')
      .that.deep.equals(123);
    expect(obj).to.have.property('value')
      .that.is.a('number')
      .that.deep.equals(456);
    expect(Object.keys(obj)).to.have.length(2);
  });

  it('#unique', function() {
    var arr = [1, 2, 3, 3, false, true, 0, {key:1}, {key:1}];
    utils.unique(arr);

    expect(arr).to.be.an('array');
    expect(arr).to.have.length(7);
    expect(arr).to.include(1);
    expect(arr).to.include(2);
    expect(arr).to.include(3);
    expect(arr).to.include(false);
    expect(arr).to.include(true);
    expect(arr).to.include(0);
    expect(arr).to.include({key:1});
  });

  it('#isAbsUrl', function() {
    var yes = [
      'http://www.baidu.com',
      'https://www.baidu.com/',
      'ftp://mobile/e/files/'
    ];
    var no = [
      'a/b/c',
      './a/b',
      '.././a/'
    ];
    yes.forEach(function(url) {
      expect(utils.isAbsUrl(url)).to.be.true();
    });
    no.forEach(function(url) {
      expect(utils.isAbsUrl(url)).to.be.false();
    });
  });

  it('#compose', function() {

  });

});

