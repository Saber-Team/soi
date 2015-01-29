var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var optimizer = require(base.optimizer_dir + '/index');

describe('direct async cases', function() {

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
              input     : './directAsync/main.js',
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

  it('#direct async', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './directAsync/main.js'));

    var css_a = ResourceTable.getResource('js', id);
    expect(css_a).to.be.an('object');
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir +
        './directAsync/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('js', id);
    expect(rsc).to.be.an('object');
    expect(rsc).to.have.property('files').with.length(2);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

});