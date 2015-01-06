var util = require('util');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');


function extend(target, src) {
  for(var k in src) {
    target[k] = src[k];
  }
}


function isDirectory(path) {
  var stat = fs.lstatSync(path);
  return stat.isDirectory();
}


function isFile(path) {
  var stat = fs.lstatSync(path);
  return stat.isFile();
}


function isArray(o) {
  return util.isArray(o);
}


function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
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
      encoding: encoding ? encoding : ''
    });

  shasum1.update(ctn);
  return {
    content: ctn,
    hex: shasum1.digest('hex').substr(0, 8)
  }
}


function getStringHash(str, encoding) {
  var shasum1 = crypto.createHash('sha1');
  shasum1.update(str);
  return {
    content: str,
    hex: shasum1.digest('hex').substr(0, 8)
  }
}


function readFile(path, option) {
  try {
    var code = fs.readFileSync(path, {
      encoding: option && option.encoding || ''
    });
  } catch (ex) {
    console.error('When trying to read content of file located: \n  ' +
      path + ' error occurred!\n  ' + ex.message);
    process.exit(1);
  }

  return code;
}


function writeFile(path, data, option) {
  try {
    fs.writeFileSync(path, data, {
      encoding: option && option.encoding || ''
    });
  } catch (ex) {
    console.error('When trying to write content to file located: \n  ' +
      path + ' error occurred!\n  ' + ex.message);
    process.exit(1);
  }
}


function isAbsUrl(url) {
  return /:\//.test(url);
}


function normalizeSysPath(p) {
  return path.normalize(p).replace(/\\/g, '/');
}


exports.extend = extend;
exports.isArray = util.isArray;
exports.isObject = isObject;
exports.inherits = util.inherits;
exports.unique = unique;
exports.isDirectory = isDirectory;
exports.isFile = isFile;
exports.getFileHash = getFileHash;
exports.getStringHash = getStringHash;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.isAbsUrl = isAbsUrl;
exports.normalizeSysPath = normalizeSysPath;