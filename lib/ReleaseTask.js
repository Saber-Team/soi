/**
 * @file release task
 * @author AceMood, XCB
 */

var inherits = require('util').inherits;
var path =require('path');
var fs = require('fs');
var Task = require('./Task');

function ReleaseTask(name, options, soiOptions, args, map) {
  Task.apply(this, arguments);
}

inherits(ReleaseTask, Task);

ReleaseTask.prototype.flushInternal = function() {
  var task = this;
  soi.util.map(task.map.resourcePathMap, function(key, resource) {
    if (!resource.getContent().trim()) {
      soi.log.info('Skip empty file [' + resource.path + ']');
      return;
    }

    var distPath = path.join(task.options.dir, resource.uri);
    soi.log.info('Flushing: [' + resource.path + '] ===> [' + distPath + ']');

    resource.flush(distPath, function(err) {
      if (err) {
        soi.log.error('flush error: [' + err + ']');
        return ;
      }
      soi.log.ok('flush success: [Saved: ' + distPath + ']');
    });
  });

  soi.util.writeFile(task.options.mapTo, soi.util.shimMap(task.map), 'utf8', function(err, msg) {
    if (err) {
      soi.log.error('Write map.json error: ' + err);
      return ;
    }
    soi.log.ok('Write map.json success ' + msg);
  });
};

module.exports = ReleaseTask;