var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var ModuleManager = require(base.optimizer_dir + '/module/manager');
var soi = require(base.soi_path);
var optimizer = require(base.optimizer_dir + '/index');

describe('multi async cases', function() {

  before(function() {
    soi.config.set({
      encoding : 'utf8',
      base_dir : __dirname + '/',
      module_loader: '../../../lib/kernel.js',
      dist_dir : './dist/',
      bundles: {
        js: [
          {
            input     : './multi_noconflict/main.js',
            files     : null,
            exclude   : {},
            defer     : false,
            dist_file : 'main.js',
            dist_dir  : './dist/'
          }
        ]
      }
    });

    soi().use(optimizer).go();
  });

  after(function() {
    global.soi = null;
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  // 主模块
  it('#main entry resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/main.js'));

    var css_a = ResourceTable.getResource('js', id);
    expect(css_a).to.be.an('object');
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  // 主模块
  it('#main entry package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/main.js'));

    var rsc = ResourceTable.getPackageByPath('js', id);
    expect(rsc).to.be.an('object');
    expect(rsc).to.have.property('files').with.length(3);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  // 异步模块1
  it('#m module', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/m.js'));

    var mod_m = ModuleManager.getModuleByPath(id);
    expect(mod_m).to.be.an('object');
    expect(mod_m.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/m.js')
    ));
    expect(mod_m.deps).to.have.length(1);

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(2);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

  // 异步模块2
  it('#n module', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/n.js'));

    var mod_n = ModuleManager.getModuleByPath(id);
    expect(mod_n).to.be.an('object');
    expect(mod_n.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './multi_noconflict/n.js')
    ));
    expect(mod_n.deps).to.have.length(1);

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(2);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

});