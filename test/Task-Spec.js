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
 * @file lib/Task.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */
/* globals soi */

describe('Task Class', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  // global
  require('../lib/soi');
  var Task = require('../lib/Task');
  var noop = function() {};

  describe('AOP plugin mechanism support', function() {

    it('onBeforeMethod', function() {
      var task = new Task('test');
      var counter = 'a';
      var context;

      task.beforeCompile = function() {
        counter += 'c';
      };
      task.onBeforeMethod('beforeCompile', function() {
        counter += 'b';
        context = this;
      });

      task.beforeCompile(noop);

      expect(counter).to.equal('abc');
      expect(context).deep.equal(task);
    });

    it('onAfterMethod', function() {
      var task = new Task('test');
      var counter = 1;
      var context;

      task.beforeCompile = function() {
        counter++;
      };
      task.onAfterMethod('beforeCompile', function() {
        counter += 'b';
        context = this;
      });

      task.beforeCompile(noop);

      expect(counter).to.equal('2b');
      expect(context).deep.equal(task);
    });

  });

});