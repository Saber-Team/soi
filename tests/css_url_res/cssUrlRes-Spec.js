var chai = require('chai');
var expect = chai.expect;
var res = require('../../lib/resolver/cssUrlRes');


describe('regexp for css url resolve', function() {

  describe('#url', function() {

    it('normally double-quotes around', function() {
      var expected = '../img/a.png';
      [
        'url("../img/a.png")',
        'url("../img/a.png") no-repeat',
        'url("../img/a.png") no-repeat 0 10px',
        '#fff url("../img/a.png") no-repeat 0 10px'
      ]
        .forEach(function(url) {
          var ret = url.match(res.RE_URL);
          expect(ret[1]).to.equal(expected);
        });
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

  describe('#background', function() {

    it('background props', function() {
      [
        'background',
        '*background',
        '_background',
        '-o-background',
        '-ms-background',
        '-moz-background',
        '-webkit-background'
      ]
        .forEach(function(url) {
          expect(res.BACKGROUND_IMAGE.test(url)).to.be.true();
        });
    });

    it('background-image props', function() {
      [
        '*background-image',
        '_background-image',
        'background-image',
        '-o-background-image',
        '-ms-background-image',
        '-moz-background-image',
        '-webkit-background-image'
      ]
        .forEach(function(url) {
          expect(res.BACKGROUND_IMAGE.test(url)).to.be.true();
        });
    });

  });

  describe('#border-image', function() {

    it('border-image', function() {
      [
        'border-image',
        '-o-border-image',
        '-ms-border-image',
        '-moz-border-image',
        '-webkit-border-image'
      ]
        .forEach(function(url) {
          expect(res.BORDER_IMAGE.test(url)).to.be.true();
        });
    });

    it('border-image-source', function() {
      [
        'border-image-source',
        '-o-border-image-source',
        '-ms-border-image-source',
        '-moz-border-image-source',
        '-webkit-border-image-source'
      ]
        .forEach(function(url) {
          expect(res.BORDER_IMAGE.test(url)).to.be.true();
        });
    });

  });

  describe('#filter', function() {

    it('ie filter', function() {
      [
        'filter',
        '*filter',
        '-ms-filter',
        '_filter'
      ]
        .forEach(function(url) {
          expect(res.FILTER.test(url)).to.be.true();
        });
    });

  });

  describe('#getBgImages', function() {

    it('single bg image', function() {
      var expected = '../img/a.png';
      [
        'url("../img/a.png")',
        'url("../img/a.png") no-repeat',
        'url("../img/a.png") no-repeat 0 10px',
        '#fff url("../img/a.png") no-repeat 0 10px'
      ]
        .forEach(function(url) {
          var ret = res.getBgImages(url);
          // todo find Array equal
          expect(ret[0]).to.equal(expected);
        });
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
          var ret = res.getBgImages(url);
          expect(ret[0]).to.equal(expected);
        });
    });

    it('multi bg image', function() {
      var expected = '../img/a.png';
      [
        'url("../img/a.png"), url("../img/a.png")',
        'url("../img/a.png") no-repeat, url("../img/a.png") no-repeat',
        'url("../img/a.png") no-repeat 0 10px, url("../img/a.png") no-repeat 0 10px',
        '#fff url("../img/a.png") no-repeat 0 10px, #fff url("../img/a.png") no-repeat 0 10px'
      ]
        .forEach(function(url) {
          var ret = res.getBgImages(url);
          expect(ret.length).to.equal(2);
          expect(ret[0]).to.equal(expected);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('no-quote multi bg image', function() {
      var expected = '../img/a.png';
      [
        'url(../img/a.png), url(../img/a.png)',
        'url(../img/a.png) no-repeat, url(../img/a.png) no-repeat',
        'url(../img/a.png) no-repeat 0 10px, url(../img/a.png) no-repeat 0 10px',
        '#fff url(../img/a.png) no-repeat 0 10px, #fff url(../img/a.png) no-repeat 0 10px'
      ]
        .forEach(function(url) {
          var ret = res.getBgImages(url);
          expect(ret.length).to.equal(2);
          expect(ret[0]).to.equal(expected);
          expect(ret[1]).to.equal(expected);
        });
    });

    it('no bg image', function() {
      [
        'none',
        '#ffffff',
        'solid #ccc 1px'
      ]
        .forEach(function(url) {
          var ret = res.getBgImages(url);
          expect(ret.length).to.equal(0);
        });
    });

  });

  describe('#getFilters', function() {

    it('filter src', function() {
      var expected = 'top.png';
      [
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='top.png');",
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', src='top.png');",
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src='top.png');",
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=top.png);",
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', src=top.png);",
        "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='corp', src=top.png);"
      ]
        .forEach(function(url) {
          var ret = res.getFilters(url);
          // todo find Array equal
          expect(ret.length).to.equal(1);
          expect(ret[0]).to.equal(expected);
        });
    });

  });

  describe('#getHTCs', function() {

    it('single behavior url', function() {
      var expected = 'ul.htc';
      [
        'url(ul.htc)',
        'url("ul.htc")'
      ]
        .forEach(function(url) {
          var ret = res.getHTCs(url);

          // todo find Array equal
          expect(ret.length).to.equal(1);
          expect(ret[0]).to.equal(expected);
        });
    });

    it('multi behavior url', function() {
      var expected = 'ul.htc';
      [
        'url(ul.htc) url(ul.htc)',
        'url(ul.htc)    url(ul.htc)',
        'url("ul.htc") url("ul.htc")',
        'url("ul.htc")    url("ul.htc")'
      ]
        .forEach(function(url) {
          var ret = res.getHTCs(url);

          // todo find Array equal
          expect(ret.length).to.equal(2);
          expect(ret[0]).to.equal(expected);
          expect(ret[1]).to.equal(expected);
        });
    });

  });

  describe('#getImportUrl', function() {

    it('single url', function() {
      var expected = 'a.css';
      [
        'url("a.css")',
        'url(a.css)',
        '"a.css"'
      ]
        .forEach(function(url) {
          var ret = res.getImportUrl(url);

          // todo find Array equal
          expect(ret.length).to.equal(1);
          expect(ret[0]).to.equal(expected);
        });
    });

  });

  describe('#getWebFonts', function() {

    it('single font url', function() {
      var expected = 'a.eot';
      [
        'url("a.eot")',
        'url(a.eot)',
        "url('a.eot')"
      ]
        .forEach(function(url) {
          var ret = res.getWebFonts(url);

          // todo find Array equal
          expect(ret.length).to.equal(1);
          expect(ret[0]).to.equal(expected);
        });
    });

    it('multi font url', function() {
      [
        'url(a.ttf),url(b.woff)',
        'url(a.ttf),\nurl(b.woff)',
        'url("a.ttf"),url("b.woff")',
        'url("a.ttf"),\r\nurl("b.woff")'
      ]
        .forEach(function(url) {
          var ret = res.getWebFonts(url);

          // todo find Array equal
          expect(ret.length).to.equal(2);
          expect(ret[0]).to.equal('a.ttf');
          expect(ret[1]).to.equal('b.woff');
        });
    });

  });

});