/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file lib/RuleMap.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('RuleMap functionality', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  var RuleMap = require('../lib/RuleMap');

  it('map should accept string rules', function() {
    var map = new RuleMap();
    map
      .add('*.js', {
        to: 'dist/static/js/'
      })
      .add('*.css', {
        to: 'dist/static/css/'
      });

    expect(map.match('src/less/base.css').to).to.equal('dist/static/css/');
    expect(map.match('src/js/base.js').to).to.equal('dist/static/js/');
  });

  it('map should accept regexp rules', function() {
    var map = new RuleMap();
    map
      .add(/(.*)\.js$/, {
        to: 'dist/static/js/'
      })
      .add(/(.*)\.css$/, {
        to: 'dist/static/css/'
      });

    expect(map.match('src/less/base.css').to).to.equal('dist/static/css/');
    expect(map.match('src/js/base.js').to).to.equal('dist/static/js/');
  });

  it('map should detect existed rules', function() {
    var map = new RuleMap();
    map
      .add('*.js', {
        to: 'dist/static/js/'
      })
      .add('*.css', {
        to: 'dist/static/css/'
      });

    expect(map.exists('*.css')).to.be.true;
    expect(map.exists('*.jsx')).to.be.false;

    map.add(/foo+/, {to: 'foo/'});
    expect(map.exists(/foo+/)).to.be.true;
    expect(map.exists(/foo+/g)).to.be.false;
    expect(map.exists(/foo+/i)).to.be.false;
    expect(map.exists(/foo+/m)).to.be.false;
  });

  it('match should apply the latest rule', function() {
    var map = new RuleMap();
    map
      .add('*.js', {
        to: 'dist/static/jsx/'
      })
      .add('*.js', {
        to: 'dist/static/js/'
      });

    expect(map.match('src/js/base.js').to).to.equal('dist/static/js/');

    map.add('src/js/*.js', {
      to: 'dev/'
    });
    expect(map.match('src/js/base.js').to).to.equal('dev/');
  });

  it('map do not hit will return null', function() {
    var map = new RuleMap();
    map.add(/src\/js\/\*\.js$/, {
      to: 'dev/'
    });
    expect(map.match('src/js/base.css')).to.be.null;
  });

  it('map rules can be merged appropriately for string keys', function() {
    var map = new RuleMap();
    map.add('**.js', {
      to: 'dev/'
    });

    var another = new RuleMap();
    another.add('**.js', {
      to: 'prod/'
    });

    map.merge(another);
    expect(map.get('**.js').to).to.deep.equal('dev/');

    map.merge(another, true);
    expect(map.get('**.js').to).to.deep.equal('prod/');
  });

  it('map rules can be merged appropriately for regexp keys', function() {
    var map = new RuleMap();
    var re = /\.js$/;
    map.add(re, {
      to: 'dev/'
    });

    var another = new RuleMap();
    another.add(re, {
      to: 'prod/'
    });

    map.merge(another);
    expect(map.get(re).to).to.equal('dev/');

    map.merge(another, true);
    expect(map.get(re).to).to.equal('prod/');
  });

  it('map can be shadow cloned', function() {
    var map = new RuleMap();
    map.add('*.js', {
      to: 'dev/'
    });

    var clone = map.clone();
    expect(clone.get('*.js').to).to.deep.equal('dev/');
    expect(clone.size).to.equal(1);
  });

});