var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/cli');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + '/lib/optimizer/resource/table');
var soi = require(BASE_DIR + '/lib/soi');

describe('common resolve cases', function() {

  before(function() {
    soi.config.set({
      base_dir : __dirname + '/',
      module_loader: BASE_DIR + '/lib/kernel.js',
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

  it('#normal dependency', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './common/main.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './common/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('js', id);

    expect(rsc).to.not.be.undefined();
    expect(rsc).to.have.property('files').with.length(5);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

});