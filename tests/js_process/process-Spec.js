var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');

describe('javascript relative cases', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
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

  it('#main.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/main.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/main.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#a.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/a.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/a.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#b.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/b.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/b.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#c.js resources', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/c.js'));
    var css_a = ResourceTable.getResource('js', id);

    expect(css_a).to.not.equal(undefined);
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/c.js')
    ));
    expect(css_a.type).to.equal('js');
    expect(css_a.origin).to.equal(null);
  });

  it('#main.js content', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './js/main.js'));
    var rsc = ResourceTable.getPackageByPath('js', id);

    expect(rsc).to.not.equal(undefined);
    expect(rsc).to.have.property('files').with.length(5);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);

    var content = utils.readFile(rsc.dist_file, {
      encoding: 'utf8'
    });

    content = content.split('\n');
    content.shift();
    content = content.join('');

    expect(content).to.equal(';_def("$3",[],{key:"c"});' +
      ';_def("$2",["$3"],function(){return{key:"b"}});' +
      ';_def("$1",["$2"],function(){return{key:"a"}});' +
      ';_req(["$1"],function(){});');
  });

});