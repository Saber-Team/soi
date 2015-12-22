/**
 * @file deploy task
 * @author XCB
 */

var inherits = require('util').inherits;
var path =require('path');
var Task = require('./Task');

function DeployTask(name, options, soiOptions, args, map) {
  Task.apply(this, arguments);
}

inherits(DeployTask, Task);

DeployTask.prototype.flushInternal = function() {
  var task = this;
  var url = task.options.receiver;
  soi.util.map(task.map.resourcePathMap, function(key, resource) {
    var distPath = path.join(task.options.dir, resource.path);
    soi.log.info('Sending: [' + resource.path + '] ===> [' + distPath + ']');
    soi.util.upload(
        url,
        {to: distPath},
        resource.getContent(),
        path.basename(resource.path),
        function(err, msg) {
          if (err) {
            soi.log.error('upload error: [' + err + ']');
            return ;
          }
          soi.log.ok('upload success: [' + msg + ']');
        });
  });
};

module.exports = DeployTask;