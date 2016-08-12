/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Saber-Team
 *
 * @file lib/Workflow.js测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */
/* globals soi */

describe('Workflow Class', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  // global
  require('../lib/soi');
  var Workflow = require('../lib/Workflow');
  var noop = function() {};

  describe('AOP plugin mechanism support', function() {

    it('onBeforeMethod', function() {
      var wf = new Workflow('test');
      var counter = 'a';
      var context;

      wf.beforeCompile = function() {
        counter += 'c';
      };
      wf.onBeforeMethod('beforeCompile', function() {
        counter += 'b';
        context = this;
      });

      wf.beforeCompile(noop);

      expect(counter).to.equal('abc');
      expect(context).deep.equal(wf);
    });

    it('onAfterMethod', function() {
      var wf = new Workflow('test');
      var counter = 1;
      var context;

      wf.beforeCompile = function() {
        counter++;
      };
      wf.onAfterMethod('beforeCompile', function() {
        counter += 'b';
        context = this;
      });

      wf.beforeCompile(noop);

      expect(counter).to.equal('2b');
      expect(context).deep.equal(wf);
    });

  });

});