/**
 * Created by baidu on 16/11/11.
 */

var url = require('url');
var path = require('path');

var obj = url.parse('http://www.ex.com:8002/av');
obj.pathname = path.normalize(path.join(obj.pathname, '/static/to'));

var u = url.format(obj);

console.log(obj);
console.log(u);