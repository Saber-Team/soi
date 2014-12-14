
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;

var depth = 0;
var whitespace = '  ';
var curDir = ['.', ''];

var pre = '';


function loop(file, index, files) {

    // console.log('read: ' + file);

    var isLastItem = (index === files.length - 1);

    var stat = fs.lstatSync(curDir.join('/') + '/' + file);

    if (stat.isDirectory()) {

        pre = '';
        for(var i = 0; i < depth; i++) {
            pre += whitespace;
        }
        console.info(pre + file + '/');

        depth++;

        curDir.push(file);
        var dir = curDir.join('/') + '/';


        process(fs.readdirSync(dir));

        if (isLastItem) {
            depth--;
            curDir.pop();
        }

    }
    else if (stat.isFile()) {

        pre = '';
        for(var i = 0; i < depth; i++) {
            pre += whitespace;
        }

        // todo
        console.info(pre + file);

        if (isLastItem) {
            depth--;
            curDir.pop();
        }

    }
}


function process(files) {
    if (!files || files.length === 0)
        return;

    files.forEach(loop);
}


// go
var files = fs.readdirSync('./');
process(files);