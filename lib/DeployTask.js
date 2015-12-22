/**
 * @file DeployTask
 * @author XCB
 */


var Task = require('./Task');
var inherits = require('util').inherits;

function DeployTask () {}

inherits(DeployTask, Task);

DeployTask.prototype.deploy = function() {
    var that = this;
    var url = this.options.receiver;
    soi.util.map(this.map.resourcePathMap, function(key, item, idx) {
        var distPath = path.join(that.options.dir, item.path);
        soi.log.info('Sending: [' + item.path + '] ===> [' + distPath + ']');
        soi.util.upload(url, {to: distPath}, item._fileContent, path.basename(item.path), function(err, msg) {
            if (err) {
                soi.log.error('upload error: [' + err + ']');
                return ;
            }
            soi.log.ok('upload success: [' + msg + ']');
        });
    });
};

DeployTask.prototype.flushInternal = function () {
    this.deploy();
};

module.exports = DeployTask;

