var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var utils = require('../../lib/utils');
var res = require('../../lib/resolver/jsRequireRes');


describe('RegExp for require.async', function() {

  function read(p) {
    return utils.readFile(path.resolve(p), { encoding: 'utf8' });
  }

  describe('remove comments', function() {

    it('multi lines comments', function() {
      var content = read(__dirname + '/3.js');
      content = content.replace(res.RE_COMMENTS, '');
      expect(content).to.equal('');
    });

    it('single line comments', function() {
      var content = read(__dirname + '/4.js');
      content = content.replace(res.RE_COMMENTS, '');
      expect(content).to.equal('');
    });

  });

  describe('parse js code', function() {

    it('normal code', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/1.js');
      var ret = content.match(res.RE_REQUIRE_ASYNC);
      expect(ret[1]).to.equal(expected);
    });

    it('enter between method', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/2.js');
      var ret = content.match(res.RE_REQUIRE_ASYNC);
      expect(ret[1]).to.equal(expected);
    });

    it('double quotes', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/5.js');
      var ret = content.match(res.RE_REQUIRE_ASYNC);
      expect(ret[1]).to.equal(expected);
    });

    it('single parameter', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/6.js');
      var ret = content.match(res.RE_REQUIRE_ASYNC);
      expect(ret[1]).to.equal(expected);
    });

  });

});

