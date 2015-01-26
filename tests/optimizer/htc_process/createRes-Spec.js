var BASE_DIR = '../../../';

var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require(BASE_DIR + '/lib/optimizer/index');
var utils = require(BASE_DIR + '/lib/optimizer/utils');
var ResourceTable = require(BASE_DIR + '/lib/optimizer/resource/table');
var soi = require(BASE_DIR + '/lib/soi');

describe('htc relative cases', function() {

  before(function() {
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

    cli.processConfigOptions();
    cli.parseBundlesOptions();
    cli.resolveFiles();
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