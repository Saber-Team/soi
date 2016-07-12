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
 * @file lib/soi.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */
/* globals soi */

describe('Global soi', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  // global
  require('../lib/soi');

  describe('soi.config object', function() {
    it('soi.config object', function() {
      expect(soi.config).to.be.an('object');
      expect(soi.config.set).to.be.a('function');
      expect(soi.config.get).to.be.a('function');
    });

    it('config soi object with single name', function() {
      soi.config.set('name', 'ace');
      var ret = soi.config.get('name');
      var non = soi.config.get('non-name');

      expect(ret).to.equal('ace');
      expect(non).to.be.undefined;
    });

    it('config soi object with same name will override', function() {
      soi.config.set('name', 'zmike');
      var ret = soi.config.get('name');

      expect(ret).to.equal('zmike');
    });

    it('config soi object with several names', function() {
      soi.config.set('another.me', 'ace');

      var nameObj = soi.config.get('another');
      var ret = soi.config.get('another.me');
      var non = soi.config.get('another.another');

      expect(nameObj).to.be.an('object');
      expect(ret).to.equal('ace');
      expect(non).to.be.undefined;
    });
  });

});