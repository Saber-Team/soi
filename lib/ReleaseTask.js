/**
 * @file release task
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var path =require('path');
var Task = require('./Task');

function ReleaseTask(name, options, soiOptions, args, map) {
  Task.apply(this, arguments);
}

inherits(ReleaseTask, Task);

ReleaseTask.prototype.flushInternal = function() {
  var task = this;
  soi.util.map(task.map.resourcePathMap, function(key, resource) {
    var distPath = path.join(task.options.dir, resource.path);
    soi.log.info('Flushing: [' + resource.path + '] ===> [' + distPath + ']');
    soi.fs.writeFile(distPath, resource.getContent(), function(err, msg) {
      if (err) {
        soi.log.error('flush error: [' + err + ']');
        return ;
      }
      soi.log.ok('flush success: [' + msg + ']');
    });
  });
};

module.exports = ReleaseTask;