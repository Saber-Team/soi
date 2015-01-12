var chai = require('chai');
var expect = chai.expect;
var utils = require('../../lib/utils');


describe('Utils test', function() {

  describe('#extend', function() {

    it('extend one object', function() {
      var obj = Object.create(null);
      var target = {
        name: 123,
        value: 456
      };
      utils.extend(obj, target);
      expect(obj.name).to.equal(123);
      expect(obj.value).to.equal(456);
      expect(Object.keys(obj).length).to.equal(2);
    });

  });

});

