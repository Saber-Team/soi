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

    it('no-quote around', function() {
      var expected = '../img/a.png';
      [
        'url(../img/a.png)',
        'url(../img/a.png) no-repeat',
        'url(../img/a.png) no-repeat 0 10px',
        '#fff url(../img/a.png) no-repeat 0 10px'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_URL);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('without an image', function() {
      var expected = null;
      [
        'none',
        '#ffffff',
        'solid #ccc 1px'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_URL);
          expect(ret).to.equal(expected);
        });
    });

  });

  describe('#src', function() {

    it('double-quotes around', function() {
      var expected = 'top.png';
      [
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(enabled="true", sizingMethod="corp", src="top.png")',
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(sizingMethod="corp", src="top.png")',
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(src="top.png")'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_SRC);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('single-quotes around', function() {
      var expected = 'top.png';
      [
          "progid:DXImageTransform.Microsoft.AlphaImageLoader" +
          "(enabled='true', sizingMethod='corp', src='top.png')",
          "progid:DXImageTransform.Microsoft.AlphaImageLoader" +
          "(sizingMethod='corp', src='top.png')",
          "progid:DXImageTransform.Microsoft.AlphaImageLoader" +
          "(src='top.png')"
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_SRC);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('no-quote around', function() {
      var expected = 'top.png';
      [
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(enabled="true", sizingMethod="corp", src="top.png")',
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(sizingMethod="corp", src="top.png")',
          'progid:DXImageTransform.Microsoft.AlphaImageLoader' +
          '(src="top.png")'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_SRC);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('without an image', function() {
      var expected = null;
      [
        '',
        'none',
        '#ffffff',
        'solid #ccc 1px'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_SRC);
          expect(ret).to.equal(expected);
        });
    });

  });

  describe('#import', function() {

    it('normally test', function() {
      var expected = 'a.css';
      [
        'url("a.css")',
        'url(a.css)',
        '"a.css"'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_IMPORT_URL);
          expect(ret[1]).to.equal(expected);
        });
    });

  });

});

