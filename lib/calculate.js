// system modules
var util = require('util');
var fs = require('fs');
var path = require('path');
var vm = require('vm');


// custom modules
var ModuleManager = require('./module/manager.js');


// 局部变量
var hasOwn = Object.prototype.hasOwnProperty;
var MAP, CONFIG;
var ret = [];
var visited = [];

// todo 可视化输入有向图，对于循环依赖一目了然
// todo 循环依赖的检查
function define(name, deps, fn) {

    //console.log('exec: ' + name);

    if (!tree[name]) {
        tree[name] = deps;
    }

    if (ret.indexOf(name) == -1) {
        ret.push(name);
    }

    deps.forEach(function(dep) {
        var index = ret.indexOf(dep);

        if (index == -1) {
            var path = MAP[dep];
            var code = fs.readFileSync(path, { encoding: CONFIG.encoding });
            code = vm.createScript(code);
            code.runInNewContext({ define: define });
        }
    });

    //console.log('exec: ' + name + ' finish!');
}

function unique(arr) {
    var seen = {},
        cursorInsert = 0,
        cursorRead = 0;

    while (cursorRead < arr.length) {
        var current = arr[cursorRead++];
        var key = (typeof current).charAt(0) + current;

        if (!hasOwn.call(seen, key)) {
            seen[key] = true;
            arr[cursorInsert++] = current;
        }
    }
    arr.length = cursorInsert;
}


function constructTree(node) {

    function t(deps) {
        visited = visited.concat(deps);
        deps.forEach(function(dep) {
            t(tree[dep] || []);
        });
    }

    visited.push(node);
    t(tree[node] || []);

    unique(visited.reverse());
}


function calculate(input, map, cfg) {
    var inputpath = path.resolve(input);
    MAP = map;
    MAP[input] = inputpath;
    CONFIG = cfg;

    var code = fs.readFileSync(inputpath, { encoding: CONFIG.encoding });
    code = vm.createScript(code);

    code.runInNewContext({ define: define });

    constructTree(ret[0]);

    visited = visited.map(function(name){
        return MAP[name];
    });

    return visited;
}


// exports
module.exports = calculate;