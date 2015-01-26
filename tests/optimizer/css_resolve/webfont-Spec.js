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

describe('web font', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
      base_dir : __dirname + '/',
      output_base: './',
      bundles: {
        font: [
          {
            input     : null,
            files     : [ './font/' ],
            exclude   : {},
            defer     : false,
            dist_file : null,
            dist_dir  : './dist/'
          }
        ],
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
            files     : ['./css/wf.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'wf.css',
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
      path.join(SOI_CONFIG.base_dir + './css/wf.css'));

    var css_a = ResourceTable.getResource('css', id);
    expect(css_a).to.not.be.null();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/wf.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#package', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/wf.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    expect(rsc).to.not.be.null();
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  it('#content', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/wf.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    // todo: see https://github.com/reworkcss/css/issues/60
    /*
     var content = utils.readFile(rsc.dist_file, {
     encoding: 'utf8'
     });

     expect(content).to.equal('@font-face{font-family:"my-style";src:url(a_da39a3ee.eof),' +
     '\r\n        url(http://www.sogou.com/a.eof);}');*/
  });
});