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
      var content = read(__dirname + '/mc.js');
      content = res.removeComments(content);
      expect(content).to.equal('');
    });

    it('single line comments', function() {
      var content = read(__dirname + '/sc.js');
      content = res.removeComments(content);
      expect(content).to.equal('');
    });

  });

  describe('parse js code', function() {

    it('normal code style', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/1.js');
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal(expected);
    });

    it('newline before method', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/2.js');
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal(expected);
    });

    it('double quotes', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/5.js');
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal(expected);
    });

    it('single parameter', function() {
      var expected = 'a.js';
      var content = read(__dirname + '/6.js');
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal(expected);
    });

    it('multi requires', function() {
      var content = read(__dirname + '/7.js');
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(3);
      expect(urls[0]).to.equal('a.js');
      expect(urls[1]).to.equal('b.js');
      expect(urls[2]).to.equal('c.js');
    });

  });

});

