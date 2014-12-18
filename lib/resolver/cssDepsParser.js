// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');

// Custom
var utils = require('../utils');
var unique = utils.unique;
var RES = require('./cssUrlRes');


// local vars
var tree = {};
var sequence = [];


function loop(startPath, encoding) {
    if (sequence.indexOf(startPath) === -1) {
        sequence.push(startPath);
    }

    // read entry point file
    var content = utils.readFile(startPath, { encoding: encoding });
    var ast = css.parse(content);

    if (ast.stylesheet && ast.stylesheet.rules) {
        var deps = [];
        ast.stylesheet.rules.forEach(function(rule) {
            if (rule.type === 'import') {
                var _path = rule.import.match(RES.RE_URL)[1];
                var dir = path.dirname(startPath);
                var absPath = path.resolve(dir, _path);
                deps.push(absPath);
            }
        });

        if (!tree[startPath]) {
            tree[startPath] = deps;
        }
        deps.forEach(function(absPath) {
            loop(absPath, encoding);
        });
    }
}


// build the tree
function constructTree(node) {
    var visited = [];
    function t(deps) {
        visited = visited.concat(deps);
        deps.forEach(function(dep) {
            t(tree[dep] || []);
        });
    }

    visited.push(node);
    t(tree[node] || []);

    unique(visited.reverse());
    return visited;
}


/**
 * Calculate css module dependency
 * @param {String} startPath Start file path.
 * @param {String} encoding Content encoding for parsing.
 * @param {Function} callback
 * @return {Array.<String>} Return
 */
function parse(startPath, encoding, callback) {
    loop(startPath, encoding);
    return constructTree(sequence[0]);
}


exports.parse = parse;