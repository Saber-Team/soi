var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ProcesssorFactory = require('../../lib/processor/factory');
var ResourceTable = require('../../lib/resource/table');

describe('create image resources', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
      base_dir : __dirname + '/',
      bundles: {
        img: [
          {
            input     : null,
            files     : [ './img/' ],
            exclude   : {},
            defer     : false,
            dist_file : null,
            dist_dir  : './dist/'
          },
          {
            input     : null,
            files     : [ './img/c.png' ],
            exclude   : {},
            defer     : false,
            dist_file : null,
            dist_dir  : './dist/'
          }
        ]
      }
    };
    // 需要先针对路径处理cwd问题
    cli.processConfigOptions();

    ProcesssorFactory
      .getInstance('img')
      .traverse();
  });

  after(function() {
    global.SOI_CONFIG = null;
    rimraf(path.join(__dirname, 'dist/inner/'), function(err) {
      //debugger;
    });
    rimraf(path.join(__dirname, 'dist/'), function(err) {
      //debugger;
    });
  });

  it('a.png in img', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/a.png'));
    var img = ResourceTable.getResource('img', id);

    expect(img).to.not.equal(undefined);
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/a.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/')
    ));
  });

  it('b.png in img/inner/', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/inner/b.png'));
    var img = ResourceTable.getResource('img', id);

    expect(img).to.not.equal(undefined);
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/inner/b.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/')
    ));
  });

  it('c.png in img', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/c.png'));
    var img = ResourceTable.getResource('img', id);

    expect(img).to.not.equal(undefined);
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/c.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './img/')
    ));
  });

});