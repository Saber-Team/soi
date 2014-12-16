
function extend(target, src) {
    for(var k in src) {
        target[k] = src[k];
    }
}


function isDirectory(path) {
    // todo too simple check
    return /\/$/.test(path);
}


function isArray(o) {
    return {}.toString.call(o) === '[object Array]';
}


function unique(arr) {
    var seen = {},
        cursorInsert = 0,
        cursorRead = 0;

    while (cursorRead < arr.length) {
        var current = arr[cursorRead++];
        var key = (typeof current).charAt(0) + current;

        if (!Object.prototype.hasOwnProperty.call(seen, key)) {
            seen[key] = true;
            arr[cursorInsert++] = current;
        }
    }
    arr.length = cursorInsert;
}


function getFileHash(path, encoding) {
    var shasum1 = crypto.createHash('sha1');
    var ctn = fs.readFileSync(path,
        {
            encoding: encoding
        });

    shasum1.update(ctn);
    return shasum1.digest('hex');
}


exports.extend = extend;
exports.isArray = isArray;
exports.unique = unique;
exports.isDirectory = isDirectory;
exports.getFileHash = getFileHash;