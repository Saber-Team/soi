var path = require('path');
var chai = require('chai');
var expect = chai.expect;
var utils = require('../../lib/utils');
var res = require('../../lib/resolver/jsRequireRes');


describe('regexp for resolve js', function() {

  describe('remove comments', function() {

    it('#multi lines comments', function() {
      var content = utils.readFile(__dirname + '/mc.js', {
        encoding: 'utf8'
      });
      content = res.removeComments(content);
      expect(content.trim()).to.equal('');
    });

    it('#single line comments', function() {
      var content = utils.readFile(__dirname + '/sc.js', {
        encoding: 'utf8'
      });
      content = res.removeComments(content);
      expect(content.trim()).to.equal('');
    });

  });

  describe('parse js code', function() {

    it('#normal code style', function() {
      var content = utils.readFile(__dirname + '/1.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal('a.js');
    });

    it('#newline before method', function() {
      var content = utils.readFile(__dirname + '/2.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal('a.js');
    });

    it('#whitespace around id', function() {
      var content = utils.readFile(__dirname + '/3.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal('a.js');
    });

    it('#double quotes', function() {
      var content = utils.readFile(__dirname + '/5.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal('a.js');
    });

    it('#single parameter', function() {
      var content = utils.readFile(__dirname + '/6.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(1);
      expect(urls[0]).to.equal('a.js');
    });

    it('#multi requires', function() {
      var content = utils.readFile(__dirname + '/7.js', {
        encoding: 'utf8'
      });
      var urls = res.getRequireUrls(content);

      expect(urls.length).to.equal(3);
      expect(urls[0]).to.equal('a.js');
      expect(urls[1]).to.equal('b.js');
      expect(urls[2]).to.equal('c.js');
    });

  });

});

