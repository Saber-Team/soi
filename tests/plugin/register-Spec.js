'use strict';

// system
var chai = require('chai');
var expect = chai.expect;

var base = require('../base');
var utils;

describe('register plugin', function() {

  before(function() {
    require(base.soi_path);
    utils = soi.utils;
  });

  after(function() {
    soi().reset();
  });

  it('#registerPlugin', function() {
    var entry = function(config) {};
    soi.registerPlugin('testA', entry);

    expect(soi.globalPlugins).to.be.an('object');
    expect(soi.globalPlugins).to.have.property('testA');
    expect(Object.keys(soi.globalPlugins)).to.have.length(1);

    var testA = soi.globalPlugins['testA'];
    expect(testA).to.be.an('object');
    expect(testA.name).to.equal('testA');
    expect(testA.entry).to.deep.equal(entry);
  });

  it('#soi().use', function() {
    var a = 10;
    var entry = function(config) {
      a = 100;
      expect(config).to.be.an('object');
      expect(Object.keys(config)).to.have.length(0);
    };
    soi.registerPlugin('testB', entry);
    soi().use('testB').go();

    expect(a).to.equal(100);
  });

});

