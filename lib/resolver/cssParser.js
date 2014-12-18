// Built-in
var path = require('path');
var fs = require('fs');

// 3rd
var css = require('css');

// Custom
var utils = require('../utils');
var unique = utils.unique;
var RES = require('./cssUrlRes');
var ResourceTable = require('../resource/table');


// local vars
var tree = {};
var codes = {};
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
        for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
            var rule = ast.stylesheet.rules[i];
            if (rule.type === 'import') {
                var _path = rule.import.match(RES.RE_URL)[1];
                var dir = path.dirname(startPath);
                var absPath = path.resolve(dir, _path);
                deps.push(absPath);
                // remove
                ast.stylesheet.rules.splice(i, 1);
                i--;

            } else if (rule.type === 'rule') {
                rule.declarations.forEach(function(declaration) {
                    // todo modify declaration.position.end.column
                    // url("../img/a.png") no-repeat;
                    if (RES.BACKGROUND_IMAGE.test(declaration.property)) {
                        var ret = declaration.value.match(RES.RE_URL);
                        if (ret) {
                            var u = ret[1];
                            var url = path.resolve(path.dirname(startPath), u);
                            // get the final path
                            var p = ResourceTable.getResource('img', url).distPath;
                            // calc the relative path to dist combo file
                            var f = path.relative(path.dirname(
                                    soi_config.dist_dir + '/' + soi_config.dist_css_file), p);

                            declaration.value = declaration.value.replace(ret[1], f);
                        }
                    }
                    // border-image:url(../img/a.png) 30 30 round;
                    if (RES.BORDER_IMAGE.test(declaration.property)) {
                        // declaration.value.replace();
                    }
                });
            }
        }

        codes[startPath] = css.stringify(ast);

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
 * @param {Object} config Global config
 * @return {Array.<String>} Return
 */
function parse(config) {
    soi_config = config;
    loop(soi_config.css_entry_point, soi_config.encoding);
    return constructTree(sequence[0]);
}


exports.parse = parse;
exports.codes = codes;