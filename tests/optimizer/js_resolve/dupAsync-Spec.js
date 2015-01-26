var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');
var ModuleManager = require('../../lib/module/manager');

describe('duplicated async cases', function() {

  before(function () {
    global.SOI_CONFIG = {
      encoding: 'utf8',
      base_dir: __dirname + '/',
      module_loader: '../../lib/kernel.js',
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
    };

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
  });

  after(function () {
    global.SOI_CONFIG = null;
    rimraf.sync(path.join(__dirname, 'dist/'), function (err) {});
  });

  // 主模块
  it('#main entry resource', function () {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './dupAsync/main.js'));

    var rsc = ResourceTable.getResource('js', id);
    expect(rsc).to.be.an('object');
    expect(rsc.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './dupAsync/main.js')
    ));
    expect(rsc.type).to.equal('js');
    expect(rsc.origin).to.equal(null);
  });

  // 主模块
  it('#main entry package', function () {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './dupAsync/main.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(3);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

  // 异步模块
  it('#async part', function () {
    id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './dupAsync/p.js'));
    var mod_p = ModuleManager.getModuleByPath(id);
    expect(mod_p).to.be.an('object');

    rsc = ResourceTable.getPackageByPath('js', id);
    expect(rsc).to.equal(null);
  });

});