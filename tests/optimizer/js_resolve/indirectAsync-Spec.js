var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils, ResourceTable, optimizer;

describe('indirect async cases', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        module_loader: base.optimizer_dir + 'kernel.js',
        dist_dir : './dist/',
        bundles: {
          js: [
            {
              input     : './indirectAsync/main.js',
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
    utils = require(base.optimizer_dir + '/utils');
    ResourceTable = require(base.optimizer_dir + '/resource/table');
    optimizer = require(base.optimizer_dir + '/index');
    soi().use(optimizer).go();
  });

  after(function() {
    optimizer.reset();
    soi().reset();
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  // 主模块
  it('#main resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './indirectAsync/main.js'));

    var mod_main = ResourceTable.getResource('js', id);
    expect(mod_main).to.be.an('object');
    expect(mod_main.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './indirectAsync/main.js')
    ));
    expect(mod_main.type).to.equal('js');
    expect(mod_main.origin).to.equal(null);
  });

  // 主模块
  it('#main package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './indirectAsync/main.js'));

    var pkg = ResourceTable.getPackageByPath('js', id);
    expect(pkg).to.be.an('object');
    expect(pkg).to.have.property('files').with.length(3);
    expect(fs.existsSync(pkg.dist_file)).to.equal(true);
  });

});