var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var optimizer = require(base.optimizer_dir + '/index');

describe('htc relative cases', function() {

  before(function() {
    require(base.soi_path);
    soi.config.set({
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
    });

    soi().use(optimizer).go();
  });

  after(function() {
    global.soi = null;
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