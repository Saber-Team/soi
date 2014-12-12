
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


exports.extend = extend;
exports.isArray = isArray;
exports.isDirectory = isDirectory;