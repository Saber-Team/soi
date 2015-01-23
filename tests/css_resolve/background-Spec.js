var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');

describe('background image', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
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
            files     : ['./css/bgi.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'bgi.css',
            dist_dir  : './dist/'
          }
        ]
      }
    };

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
  });

  after(function() {
    global.SOI_CONFIG = null;
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  it('#resource', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css'));

    var css_a = ResourceTable.getResource('css', id);
    expect(css_a).to.not.be.null();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#package', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  it('#content', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#bgi0{background:url("a_671eaeda.png");}' +
      '#bgi1{background:url("a_671eaeda.png") no-repeat;}' +
      '#bgi2{background:url("a_671eaeda.png") no-repeat 0 -10px;}' +
      '#bgi3{background:#fff url("a_671eaeda.png");}' +
      '#bgi4{background:#fff url("a_671eaeda.png") no-repeat;}' +
      '#bgi5{background:#fff url("a_671eaeda.png") 0 -10px;}' +
      '#bgi6{background:url("a_671eaeda.png"), url("inner/b_671eaeda.png");}');
  });

});