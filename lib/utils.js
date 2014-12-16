
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




exports.extend = extend;
exports.isArray = isArray;
exports.unique = unique;
exports.isDirectory = isDirectory;