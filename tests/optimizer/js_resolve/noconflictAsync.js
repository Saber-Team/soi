var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/cli');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + '/lib/optimizer/resource/table');
var ModuleManager = require(BASE_DIR + '/lib/optimizer/module/manager');
var soi = require(BASE_DIR + '/lib/soi');

describe('non conflict async cases', function() {

  before(function() {
    soi.config.set({
      base_dir : __dirname + '/',
      module_loader:  BASE_DIR + '/lib/kernel.js',
      dist_dir : './dist/',
      bundles: {
        js: [
          {
            input     : './noconflictAsync/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'main.js',
            dist_dir  : './dist/'
          }
        ]
      }
    });

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
  });

  after(function() {
    global.soi = null;
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  // 主模块
  it('#main entry resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/main.js'));

    var css_a = ResourceTable.getResource('js', id);
    expect(css_a).to.be.an('object');
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  // 主模块
  it('#main entry package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/main.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.not.equal(undefined);
    expect(pkg).to.have.property('files').with.length(2);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

  // 异步模块
  it('#async module resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/j.js'));

    var mod_j = ModuleManager.getModuleByPath(id);
    expect(mod_j).to.be.an('object');
    expect(mod_j.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/j.js')
    ));
    expect(mod_j.deps).to.have.length(1);
  });

  // 异步模块
  it('#async module package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './noconflictAsync/j.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.not.be.undefined();
    expect(pkg).to.have.property('files').with.length(2);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

});