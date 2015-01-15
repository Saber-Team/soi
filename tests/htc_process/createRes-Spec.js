var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var cli = require('../../lib/cli');
var utils = require('../../lib/utils');
var ResourceTable = require('../../lib/resource/table');

describe('htc relative cases', function() {

  before(function() {
    global.SOI_CONFIG = {
      encoding : 'utf8',
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

  it('#created htc resource', function() {
    var id = utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './htc/ie.htc'));
    var htc = ResourceTable.getResource('htc', id);

    expect(htc).to.not.equal(undefined);
    expect(htc.path).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './htc/ie.htc')
    ));
    expect(htc.type).to.equal('img');
    expect(htc.origin).to.equal(utils.normalizeSysPath(
      path.join(SOI_CONFIG.base_dir + './htc/')
    ));
  });

});