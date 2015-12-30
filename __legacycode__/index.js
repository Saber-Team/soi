/**
 * Created by baidu on 15/12/30.
 */

var fs = require('fs');
//
var buf = fs.readFileSync('finish.png');

console.log(buf instanceof Buffer);
//
// var content = buf.toString('utf8');
//
////console.log(content);

fs.writeFile('ddd.png', buf, null, function() {

});

//var soifs = require('./soi/fs');
//var _ = soifs.readFile('finish.png', {
//  encoding: 'utf8'
//});
//soifs.writeFile('ddd.png', _, {
//  encoding: 'base64'
//});