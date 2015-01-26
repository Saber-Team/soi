var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/optimizer/index');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + 'lib/optimizer/resource/table');
var soi = require(BASE_DIR + '/lib/soi');

describe('css relative cases', function() {

  before(function() {
    soi.config.set({
      optimizer: {
        base_dir : __dirname + '/',
        bundles: {
          css: [
            {
              input     : './css/main.css',
              files     : null,
              exclude   : {},
              defer     : false,
              dist_file : 'main.css',
              dist_dir  : './dist/'
            },
            {
              input     : null,
              files     : [
                './css/d.css',
                './css/e.css'
              ],
              exclude   : {},
              defer     : false,
              dist_file : 'bundle.css',
              dist_dir  : './dist/'
            }
          ]
        }
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

  it('#main.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/main.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/main.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#a.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/a.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/a.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#b.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/b.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/b.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#c.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/c.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/c.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#d.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/d.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/d.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#e.css resources', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/e.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.be.undefined();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/e.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#main.css content', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/main.css'));
    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.be.undefined();
    expect(rsc).to.have.property('files').with.length(4);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#divc{height:100px;}\n' +
      '#divb{width:100px;}\n' + '' +
      '#diva{width:100px;}\n');
  });

  it('#bundle.css content', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/e.css'));
    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.be.undefined();
    expect(rsc).to.have.property('files').with.length(2);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#divd{width:100px;}\n' +
      '#dive{width:100px;}');
  });

});