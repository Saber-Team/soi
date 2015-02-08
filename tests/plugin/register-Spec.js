'use strict';

// system
var chai = require('chai');
var expect = chai.expect;

var base = require('../base');
var utils;

describe('plugin relative', function() {

  var entry;

  before(function() {
    require(base.soi_path);
    utils = soi.utils;
  });

  after(function() {
    soi().reset();
  });

  it('#register plugin store in global', function() {
    var entry = function(config) {};
    soi.registerPlugin('testA', entry, {});

    expect(soi.globalPlugins).to.be.an('object');
    expect(soi.globalPlugins).to.have.property('testA');
    expect(Object.keys(soi.globalPlugins)).to.have.length(1);

    var testA = soi.globalPlugins['testA'];
    expect(testA).to.be.an('object');
    expect(testA.name).to.equal('testA');
    expect(testA.entry).to.deep.equal(entry);
    expect(testA.cmd).to.deep.equal('');
    expect(testA.requires).to.be.an('array').that.to.have.length(0);
  });

  it('#use plugin do not executed', function() {
    var a = 10;
    var entry = function(config) {
      a = 100;
      expect(config).to.be.an('object');
      expect(Object.keys(config)).to.have.length(0);
    };
    soi.registerPlugin('testB', entry, {});
    soi().use(soi.globalPlugins['testB'].entry);

    expect(a).to.equal(10);
  });

  it('#drop plugin do not executed', function() {
    var a = 10;
    entry = function(config) {
      a = 100;
    };
    soi.registerPlugin('testC', entry, {});
    soi()
      .use(soi.globalPlugins['testC'].entry)
      .drop(soi.globalPlugins['testC'].entry).go();

    expect(a).to.equal(10);
  });

  it('#global still have plugin be dropped', function() {
    var testC = soi.globalPlugins['testC'];
    expect(testC).to.be.an('object');
    expect(testC.name).to.equal('testC');
    expect(testC.entry).to.deep.equal(entry);
    expect(testC.cmd).to.deep.equal('');
    expect(testC.requires).to.be.an('array').that.to.have.length(0);
  });

  it('#soi self also have plugin be dropped', function() {
    var plugins = soi().plugins;
    expect(plugins).to.be.an('array');
    expect(plugins).to.have.length(2); // b and c

    var pluginC = soi().plugins[1];
    expect(pluginC.entry).to.deep.equal(entry);
    expect(pluginC.isUsed).to.be.false();
  });

  it('#findPluginsByCommand', function() {
    var entry = function(config) {};
    soi.registerPlugin('testD', entry, {
      cmd: 'testd'
    });

    expect(soi.globalPlugins).to.be.an('object');
    expect(soi.globalPlugins).to.have.property('testD');
    expect(Object.keys(soi.globalPlugins)).to.have.length(4);

    var testD = soi.findPluginsByCommand('testd');
    expect(testD).to.be.an('array');
    expect(testD).to.have.length(1);
    expect(testD[0]).to.be.a('function');
    expect(testD[0]).to.deep.equal(entry);
  });

});

