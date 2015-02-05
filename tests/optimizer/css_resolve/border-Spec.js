var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils, ResourceTable, optimizer;

describe('border image', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        output_base: './',
        bundles: {
          img: [
            {
              input     : null,
              files     : [ './img/' ],
              exclude   : {},
              defer     : false,
              dist_file : null,
              dist_dir  : './dist/'
            }
          ],
          css: [
            {
              input     : null,
              files     : ['./css/bi.css'],
              exclude   : {},
              defer     : false,
              dist_file : 'bi.css',
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

  it('#resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/bi.css'));

    var css_a = ResourceTable.getResource('css', id);
    expect(css_a).to.not.be.null();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/bi.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/bi.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    expect(rsc).to.not.be.null();
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  it('#content', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/bi.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#bi0{-webkit-border-image:url(a_671eaeda.png) 30 30 round;' +
      '-o-border-image:url(a_671eaeda.png) 30 30 round;' +
      'border-image:url(a_671eaeda.png) 30 30 round;}' +
      '#bi1{-webkit-border-image:url("a_671eaeda.png") 30 30 round;' +
      '-o-border-image:url("a_671eaeda.png") 30 30 round;' +
      'border-image:url("a_671eaeda.png") 30 30 round;}' +
      '#bi2{-webkit-border-image:url(a_671eaeda.png) 30 30 stretch;' +
      '-o-border-image:url(a_671eaeda.png) 30 30 stretch;' +
      'border-image:url(a_671eaeda.png) 30 30 stretch;}');
  });
});