var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/optimizer/index');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + '/lib/optimizer/resource/table');
var ModuleManager = require(BASE_DIR + '/lib/optimizer/module/manager');
var soi = require(BASE_DIR + '/lib/soi');

describe('duplicated async cases', function() {

  before(function () {
    soi.config.set({
      base_dir: __dirname + '/',
      module_loader: BASE_DIR + '/lib/kernel.js',
      dist_dir: './dist/',
      bundles: {
        js: [
          {
            input: './dupAsync/main.js',
            files: null,
            exclude: {},
            defer: false,
            dist_file: 'main.js',
            dist_dir: './dist/'
          }
        ]
      }
    });

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
  });

  after(function () {
    global.soi = null;
    rimraf.sync(path.join(__dirname, 'dist/'), function (err) {});
  });

  // 主模块
  it('#main entry resource', function () {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './dupAsync/main.js'));

    var rsc = ResourceTable.getResource('js', id);
    expect(rsc).to.be.an('object');
    expect(rsc.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './dupAsync/main.js')
    ));
    expect(rsc.type).to.equal('js');
    expect(rsc.origin).to.equal(null);
  });

  // 主模块
  it('#main entry package', function () {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './dupAsync/main.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(3);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

  // 异步模块
  it('#async part', function () {
    id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './dupAsync/p.js'));
    var mod_p = ModuleManager.getModuleByPath(id);
    expect(mod_p).to.be.an('object');

    rsc = ResourceTable.getPackageByPath('js', id);
    expect(rsc).to.equal(null);
  });

});