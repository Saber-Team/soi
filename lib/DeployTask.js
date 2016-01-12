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
    var distPath = path.join(task.options.dir, resource.uri);
    soi.log.info('Sending: [' + resource.path + '] ===> [' + distPath + ']');
    soi.util.upload(
        url,
        {to: distPath},
        resource.getContent(),
        path.basename(resource.path),
        function(err, msg) {
          if (err) {
            soi.log.error('upload [' + resource.path + '] error: [' + err + ']');
            return ;
          }
          soi.log.ok('upload [' + resource.path + '] success: [' + msg + ']');
        }
    );
  });
  var mapJsonPath = path.join(task.options.dir, task.options.mapTo);
  soi.log.info('Sending: [map.json] ===> [' + mapJsonPath + ']');
  soi.util.upload(
    url,
    {to: mapJsonPath},
    soi.util.shimMap(task.map),
    path.basename(mapJsonPath),
    function(err, msg) {
      if (err) {
        soi.log.error('upload [map.json] error: [' + err + ']');
        return ;
      }
      soi.log.ok('upload [map.json] success: [' + msg + ']');
    }
  )
};

module.exports = DeployTask;