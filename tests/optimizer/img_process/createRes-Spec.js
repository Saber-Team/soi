var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var optimizer = require(base.optimizer_dir + '/index');

describe('image relative cases', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
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
      }
    });
    soi().use(optimizer).go();
  });

  after(function() {
    optimizer.reset();
    soi().reset();
    rimraf.sync(path.join(__dirname, 'dist/'), function(err) {});
  });

  it('#a.png in img', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/a.png'));

    var img = ResourceTable.getResource('img', id);
    expect(img).to.not.be.undefined();
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/a.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/')
    ));
  });

  it('#b.png in img/inner/', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/inner/b.png'));

    var img = ResourceTable.getResource('img', id);
    expect(img).to.not.be.undefined();
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/inner/b.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/')
    ));
  });

  it('#c.png in img', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/c.png'));

    var img = ResourceTable.getResource('img', id);
    expect(img).to.not.be.undefined();
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/c.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './img/')
    ));
  });

});