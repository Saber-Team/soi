var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');

describe('css resolve cases', function() {

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
        htc: [
          {
            input     : null,
            files     : [ './htc/' ],
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
            files     : ['./css/bgi.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'bgi.css',
            dist_dir  : './dist/'
          },
          {
            input     : null,
            files     : ['./css/bi.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'bi.css',
            dist_dir  : './dist/'
          },
          {
            input     : null,
            files     : ['./css/htc.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'htc.css',
            dist_dir  : './dist/'
          },
          {
            input     : null,
            files     : ['./css/ie6.css'],
            exclude   : {},
            defer     : false,
            dist_file : 'ie6.css',
            dist_dir  : './dist/'
          },
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
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {
      //debugger;
    });
  });

  it('#background image', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bgi.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

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

  it('#border image', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bi.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/bi.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

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

  it('#behavior htc', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/htc.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/htc.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#htc0{behavior:url(ie_da8c6a4f.htc);}' +
      '#htc1{behavior:url(ie_da8c6a4f.htc) url(ie0_da8c6a4f.htc);}');
  });

  it('#ie filter', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/ie6.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/ie6.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });
    expect(content).to.equal('#filter0{background:none;' +
      'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="dist/inner/b_671eaeda.png");}' +
      '#filter1{background:none;' +
      'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=dist/inner/b_671eaeda.png);}' +
      '#filter2{background:none;' +
      '_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader("src=dist/inner/b_671eaeda.png");}' +
      '#filter3{background:none;' +
      '_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=dist/inner/b_671eaeda.png);}');
  });

  it('#web font', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/wf.css'));
    var css_a = ResourceTable.getResource('css', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './css/wf.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);

    var rsc = ResourceTable.getPackageByPath('css', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    // todo: see https://github.com/reworkcss/css/issues/60
    /*
    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });

    expect(content).to.equal('@font-face{font-family:"my-style";src:url(a_da39a3ee.eof),' +
      '\r\n        url(http://www.sogou.com/a.eof);}');*/
  });

});