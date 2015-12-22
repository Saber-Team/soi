/**
 * Created by baidu on 15/12/19.
 */

var Task = require('./Task');
var inherits = require('util').inherits;

function ReleaseTask () {}
inherits(ReleaseTask, Task);

module.exports = ReleaseTask;