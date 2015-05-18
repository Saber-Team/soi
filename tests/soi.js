'use strict';

// import modules
var chai = require('chai');
var expect = chai.expect;

var base = require('./base');
var utils;

describe('soi object test', function() {

  before(function() {
    require(base.soi_path);
  });

  after(function() {
    soi().reset();
  });

  it('#config', function() {
    /*
    var target = {
      name: 123,
      value: 456,
      rf: {
        a: 3,
        c: {
          name: 'c'
        },
        d: [1,2,3]
      }
    };
    var obj = utils.deepClone(target);

    expect(obj).to.be.an('object');
    expect(obj).to.have.property('name')
      .that.is.a('number')
      .that.deep.equals(123);
    expect(obj).to.have.property('value')
      .that.is.a('number')
      .that.deep.equals(456);

    expect(obj).to.have.property('rf').that.is.an('object');
    expect(obj.rf).to.have.property('a').that.deep.equals(3);
    expect(obj.rf).to.have.property('c').that.is.an('object').that
      .to.have.property('name').that.deep.equals('c');
    expect(obj.rf).to.have.property('d').that.is.an('array').that
      .to.have.length(3);

    expect(Object.keys(obj)).to.have.length(3);
    expect(Object.keys(obj.rf)).to.have.length(3);
    */
  });

});

