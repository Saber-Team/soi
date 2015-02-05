var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var optimizer = require(base.optimizer_dir + '/index');

describe('multi static resource', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        bundles: {
          img: [
            {
              input     : null,
              files     : [ './assets/' ],
              exclude   : {},
              defer     : false,
              dist_file : null,
              dist_dir  : './dist/'
            }
          ],
          htc: [
            {
              input     : null,
              files     : [ './assets/' ],
              exclude   : {},
              defer     : false,
              dist_file : null,
              dist_dir  : './dist/'
            }
          ],
          swf: [
            {
              input     : null,
              files     : [ './assets/' ],
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

  it('#a.png', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/a.png'));

    var img = ResourceTable.getResource('img', id);
    expect(img).to.not.be.undefined();
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/a.png')
    ));
    expect(img.type).to.equal('img');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/')
    ));
  });

  it('#ie.htc', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/ie.htc'));

    var img = ResourceTable.getResource('htc', id);
    expect(img).to.not.be.undefined();
    expect(img.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/ie.htc')
    ));
    expect(img.type).to.equal('htc');
    expect(img.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/')
    ));
  });

  it('#no swf', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './assets/a.swf'));

    var img = ResourceTable.getResource('swf', id);
    expect(img).to.be.null();
  });

});