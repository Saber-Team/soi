var assert = require('assert');
var RES = require('../../lib/resolver/cssUrlRes');


describe('RegExp for CSS URL resolve', function() {

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
                    var ret = url.match(RES.RE_URL);
                    assert.equal(ret[1], expected);
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
                    var ret = url.match(RES.RE_URL);
                    assert.equal(ret[1], expected);
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
                    var ret = url.match(RES.RE_URL);
                    assert.equal(ret, expected);
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
                    var ret = url.match(RES.RE_SRC);
                    assert.equal(ret[1], expected);
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
                    var ret = url.match(RES.RE_SRC);
                    assert.equal(ret[1], expected);
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
                    var ret = url.match(RES.RE_SRC);
                    assert.equal(ret[1], expected);
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
                    var ret = url.match(RES.RE_SRC);
                    assert.equal(ret, expected);
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
                    assert(RES.BACKGROUND_IMAGE.test(url));
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
                    assert(RES.BACKGROUND_IMAGE.test(url));
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
                    assert(RES.BORDER_IMAGE.test(url));
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
                    assert(RES.BORDER_IMAGE.test(url));
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
                    assert(RES.FILTER.test(url));
                });
        });

    });
});

