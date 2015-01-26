var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/optimizer/index');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + '/lib/optimizer/resource/table');
var soi = require(BASE_DIR + '/lib/soi');

describe('javascript relative cases', function() {

  before(function() {
    soi.config.set({
      base_dir : __dirname + '/',
      module_loader:  '../../lib/kernel.js',
      bundles: {
        js: [
          {
            input     : './js/main.js',
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

  it('#main.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/main.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#a.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/a.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/a.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#b.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/b.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/b.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#c.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/c.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/c.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#main.js content', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './js/main.js'));
    var rsc = ResourceTable.getPackageByPath('js', id);

    expect(rsc).to.not.be.undefined();
    expect(rsc).to.have.property('files').with.length(5);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });

    content = content.split('\n');
    content.shift();
    content = content.join('');

    expect(content).to.equal(';_def("_3",[],{key:"c"});' +
      ';_def("_2",["_3"],function(){return{key:"b"}});' +
      ';_def("_1",["_2"],function(){return{key:"a"}});' +
      ';_req(["_1"],function(){});');
  });

});