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
 * @file lib/util.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('util functionality', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  var util = require('../lib/util');

  it('merge should apply primitive fields', function() {
    var foo = {
      name: 'ace',
      bin: 'new'
    };

    var target = {
      bin: 'bin',
      arr: [1,2,3],
      nest: {
        b: 1,
        o: {
          old: 'li',
          nf: 'mq'
        }
      }
    };

    util.merge(target, foo);

    expect(target.name).to.equal('ace');
    expect(target.bin).to.equal('new');
  });

  it('merge should apply reference fields', function() {
    var bar = {
      arr: [1,2,3,4,5,6],
      nest: {
        o: {
          nf: 'qu'
        }
      }
    };

    var target = {
      bin: 'bin',
      arr: [1,2,3],
      nest: {
        b: 1,
        o: {
          old: 'li',
          nf: 'mq'
        }
      }
    };

    util.merge(target, bar);

    expect(target.arr).to.deep.equal([1,2,3,4,5,6]);
    expect(target.nest.b).to.equal(1);
    expect(target.nest.o.old).to.equal('li');
    expect(target.nest.o.nf).to.equal('qu');
  });

  it('seal should apply object methods and property', function() {
    var obj = {
      a: 'a',
      b: 'b'
    };

    util.seal(obj, ['a', 'foo']);

    obj.a = 'new a';
    obj.foo = 'new foo';

    expect(obj.a).to.equal('a');
    expect(obj.b).to.equal('b');
    expect(obj.foo).to.be.undefined;
  });

  it('normalize should make sense of regexp', function() {
    var re = util.normalize(/\.js$/);

    expect(re.test('a.js')).to.be.true;
    expect(re.test('a.jsx')).to.be.false;
  });

  describe('normalize should make sense of glob::', function() {
    it('single star', function() {
      var re = util.normalize('*.js');
      // /^(?:(?:(?!(?:\/|^)\.).)*?\/(?!\.)(?=.)[^\/]*?\.js)$/
      expect(re.test('/a.js')).to.be.true;
      expect(re.test('a.js')).to.be.false;
      expect(re.test('./a.js')).to.be.false;
      expect(re.test('/src/lib/a.js')).to.be.true;
      expect(re.test('src/lib/a.js')).to.be.true;
    });

    it('stars in path', function() {
      var re = util.normalize('src/*.js');
      // /^(?:src\/(?!\.)(?=.)[^\/]*?\.js)$/
      expect(re.test('src/a.js')).to.be.true;
      expect(re.test('src/lib/a.js')).to.be.false;
      expect(re.test('src/./a.js')).to.be.false;
      expect(re.test('lib/src/a.js')).to.be.false;
    });

    it('double stars', function() {
      var re = util.normalize('**.js');
      // /^(?:(?!\.)(?=.)[^\/]*?[^\/]*?\.js)$/
      expect(re.test('a.js')).to.be.true;
      expect(re.test('/a.js')).to.be.false;
      expect(re.test('./a.js')).to.be.false;
      expect(re.test('src/lib/a.js')).to.be.false;
    });
  });

});