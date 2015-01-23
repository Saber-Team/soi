
// load global object
var soi = require('./soi');
// only executing configuration code
require(process.cwd() + '/soi.conf');


var optimizer = require('./optimizer/index');

// go
function run() {
  soi().use(optimizer);
}

exports.run = run;