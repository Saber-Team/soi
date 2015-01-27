var chai = require('chai');
var expect = chai.expect;
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var base = require('../../base');
var utils = require(base.optimizer_dir + '/utils');
var ResourceTable = require(base.optimizer_dir + '/resource/table');
var optimizer = require(base.optimizer_dir + '/index');

describe('ie filter', function() {

  before(function() {
    require(base.soi_path);
    soi.config.set({
      optimizer: {
        base_dir : __dirname + '/',
        output_base: './',
        bundles: {
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
              files     : ['./css/ie6.css'],
              exclude   : {},
              defer     : false,
              dist_file : 'ie6.css',
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

  it('#resource', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir + './css/ie6.css'));

    var css_a = ResourceTable.getResource('css', id);
    expect(css_a).to.not.be.null();
    expect(css_a.path).to.equal(utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir.base_dir + './css/ie6.css')
    ));
    expect(css_a.type).to.equal('css');
    expect(css_a.origin).to.equal(null);
  });

  it('#package', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir.base_dir + './css/ie6.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
    expect(rsc).to.not.be.null();
    expect(rsc).to.have.property('files').with.length(1);
    expect(fs.existsSync(rsc.dist_file)).to.equal(true);
  });

  it('#content', function() {
    var id = utils.normalizeSysPath(
      path.join(soi().ENV.config.optimizer.base_dir.base_dir + './css/ie6.css'));

    var rsc = ResourceTable.getPackageByPath('css', id);
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
});