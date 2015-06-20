// Built-in
var path = require('path');
var fs = require('fs');
var vm = require('vm');

// Custom
var utils = require('../utils');
var constants = require('../constants');
var Processor = require('./processor');
var Walker = require('../dirwalker/walker');
var Resource = require('../resource/resource');
var ResourceTable = require('../resource/table');
var ModuleManager = require('../module/manager');
var environment = require('../env');


/**
 * Class deal with script resource
 * @constructor
 * @implements {Processor}
 */
var ScriptProcessor = function() {
  this.options = soi().ENV.config.optimizer;
  // current item in files array
  this.currentFilesItem = null;
  // current dist_dir for current pkg
  this.currentDistDir = null;
};

utils.inherits(ScriptProcessor, Processor);

/**
 * helper function used by traverse method
 * @param {String} base Directory name of current dealing script file
 * @param {String} fileName File name of current dealing script file
 */
ScriptProcessor.prototype.process = function(base, fileName) {
  // absolute path of original js file
  var _path = utils.normalizeSysPath(path.resolve(base, fileName));

  // skip module loader
  // because it also provide global require & define method
  // which could be affect the environment context.
  if (_path === this.options.module_loader)
    return;

  // get the js relative to the current calculate directory
  var origin = utils.normalizeSysPath(
    path.join(this.options.base_dir + this.currentFilesItem));

  // create resource instance but without generating any js file
  var resource = Resource.create({
    origin  : origin,
    type    : 'js',
    path    : _path,
    encoding: this.options.encoding,
    dist    : this.currentDistDir
  });

  // register resource table
  ResourceTable.register({
    type    : 'js',
    key     : _path,
    value   : resource
  });

  // register module
  var code = fs.readFileSync(_path, { encoding: this.options.encoding });
  code = vm.createScript(code);
  var module = code.runInNewContext(environment);
  module.setPath(_path);
  ModuleManager.register({
    id      : module.id,
    module  : module
  });
};


/**
 * create all script resources
 */
ScriptProcessor.prototype.traverse = function() {
  if (!this.options.bundles.js || this.options.bundles.js.length <= 0)
    return;

  this.options.bundles.js.forEach(function(pkg) {
    var input = pkg.input; //abs path
    this.currentDistDir = pkg.dist_dir;
    // no files field
    // TODO(zmike86): Shall we parse statments to register modules here?
    // update: We have moved the code to js resolver --> js parser
    if (input) {
      return;
    }
    // because we use unique moduleId for each module in source code,
    // so we must scan all the file first, it's very different with
    // form of requirejs, but we concern the chance of path changing of module
    // and reduce complexity of unit tests of oslo source code.
    // directly register module
    pkg.files.forEach(function(file) {
      // store the list item of js config now
      this.currentFilesItem = file;
      var stat = fs.lstatSync(this.options.base_dir + file);
      if (stat.isFile() && file.indexOf(constants.JS_FILE_PATH) === file.length - 3) {
        this.process(this.options.base_dir, file);
      } else if (stat.isDirectory()) {
        var dir = path.resolve(this.options.base_dir, file);
        var walker = new Walker({
          dirname: dir
        });
        walker.walk(this.process.bind(this));
      }
    }, this);
  }, this);
};


module.exports = ScriptProcessor;