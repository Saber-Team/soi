var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils, ResourceTable, optimizer;

describe('htc relative cases', function() {

  before(function() {
    require(base.soi_path);
    soi.config.extend({
      optimizer: {
        base_dir : __dirname + '/',
        bundles: {
          htc: [
            {
              input     : null,
              files     : [ './htc/' ],
              exclude   : {},
              defer     : false,
              dist_file : null,
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

  it('#created htc resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './htc/ie.htc'));
    var htc = ResourceTable.getResource('htc', id);

    expect(htc).to.not.equal(undefined);
    expect(htc.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './htc/ie.htc')
    ));
    expect(htc.type).to.equal('htc');
    expect(htc.origin).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './htc/')
    ));
  });

});