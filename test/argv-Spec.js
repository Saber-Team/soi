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
 * @file lib/util/argv.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('Command-Line parameters parser', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  var argv = require('../lib/util/argv');

  it('proper command extract', function() {
    var commands = ['/bin/node', 'soi', 'release', 'dev', '-f', 'demo'];
    var ret = argv.parse(commands);

    expect(ret._).to.deep.equal(['release', 'dev']);
    expect(ret.f).to.deep.equal('demo');
  });

  it('proper parameter extract', function() {
    var commands = ['/bin/node', 'soi', 'release', 'prod', '-m'];
    var ret = argv.parse(commands);

    expect(ret._).to.deep.equal(['release', 'prod']);
    expect(ret.m).to.deep.equal(true);
  })

});