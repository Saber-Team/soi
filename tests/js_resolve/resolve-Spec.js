var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');

describe('js resolve cases', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
      base_dir : __dirname + '/',
      module_loader:  '../../lib/kernel.js',
      dist_dir : './dist/',
      bundles: {
        js: [
          {
            input     : './common/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'main.js',
            dist_dir  : './dist/'
          },
          {
            input     : './directAsync/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'async0.js',
            dist_dir  : './dist/'
          },
          {
            input     : './indirectAsync/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'async1.js',
            dist_dir  : './dist/'
          },
          {
            input     : './conflictAsync/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'async2.js',
            dist_dir  : './dist/'
          },
          {
            input     : './noconflictAsync/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'async3.js',
            dist_dir  : './dist/'
          }
        ]
      }
    };

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
  });

  after(function() {
    global.SOI_CONFIG = null;
    //rimraf.sync(path.join(__dirname, 'dist/'), function(err) {
      //debugger;
    //});
  });

  it('#normal dependency', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './common/main.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './common/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('js', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(5);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  describe('#async dependency', function() {

    it('#direct async', function() {
      var id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './directAsync/main.js'));
      var css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(undefined);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './directAsync/main.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      var rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(1);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);
    });

    it('#indirect async', function() {
      var id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './indirectAsync/main.js'));
      var css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(undefined);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './indirectAsync/main.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      var rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(2);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);
    });

    it('#conflict async', function() {
      // 主模块
      var id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './conflictAsync/main.js'));
      var css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(null);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './conflictAsync/main.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      var rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(2);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);

      // 异步模块
      id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './conflictAsync/h.js'));
      css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(null);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './conflictAsync/h.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(1);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);
    });

    it('#noconflict async', function() {
      // 主模块
      var id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './noconflictAsync/main.js'));
      var css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(null);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './noconflictAsync/main.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      var rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(2);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);

      // 异步模块
      id = utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './noconflictAsync/j.js'));
      css_a = ResourceTable.getResource('js', id);

      expect(css_a).to.not.equal(null);
      expect(css_a.path).to.equal(utils.normalizeSysPath(
        path.join(SOI_CONFIG.base_dir + './noconflictAsync/j.js')
      ));
      expect(css_a.type).to.equal('js');
      expect(css_a.origin).to.equal(null);

      rsc = ResourceTable.getPackageByPath('js', id);

      expect(rsc).to.not.equal(undefined);
      expect(rsc).to.have.property('files').with.length(2);
      expect(fs.existsSync(rsc.dist_file)).to.equal(true);
    });

  });

});