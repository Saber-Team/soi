var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var ModuleManager = require(base.optimizer_dir + '/module/manager');
var optimizer = require(base.optimizer_dir + '/index');

describe('exist conflict async', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        module_loader:  base.optimizer_dir + 'kernel.js',
        dist_dir : './dist/',
        bundles: {
          js: [
            {
              input     : './conflictAsync/main.js',
              files     : null,
              exclude   : {},
              defer     : false,
              dist_file : 'main.js',
              dist_dir  : './dist/'
            }
          ]
        }
      }
    });
    soi().use(optimizer).go();
  });

  after(function() {
    optimizer.reset();
    soi().reset();
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  // 主模块
  it('#main entry resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/main.js'));

    var css_a = ResourceTable.getResource('js', id);
    expect(css_a).to.be.an('object');
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  // 主模块
  it('#main entry package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/main.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(3);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

  // 异步模块
  it('#async module resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/h.js'));

    var mod_h = ModuleManager.getModuleByPath(id);
    expect(mod_h).to.be.an('object');
    expect(mod_h.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/h.js')
    ));
    expect(mod_h.deps).to.have.length(1);
  });

  // 异步模块
  it('#async module package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './conflictAsync/h.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(1);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

});