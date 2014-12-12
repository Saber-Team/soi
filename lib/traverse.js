
// 系统模块引用
var util = require('util');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

// 自定义模块引用
var env = require('./env.js');

// 局部变量
var isJsFile = false,
    isOtherFile = false;
var content;
var config;
var baseDir;

function loop(name, base) {

    if (name in config.Preserved)
        return;

    isJsFile = name.substr(-3, 3) == config.jsFileExt;
    isOtherFile = config.otherFileExt.test(name);

    if (isOtherFile) return;
    name = path.resolve(base, name);

    //@@ debug info
    if (config.debug) console.log(name);

    // 是Js文件
    if (isJsFile) {
        var code = fs.readFileSync(name, { encoding: config.encoding });
        code = vm.createScript(code);
        var ret = code.runInNewContext({ define: define });
        content[ret] = name;
        // 是目录
    } else {
        var files = fs.readdirSync(name);
        files.forEach(function(fpath) {
            loop(fpath, path.resolve(baseDir, name));
        });
    }
}

var traverse = {
    // 配置当前模块
    config: function(cfg) {
        config = cfg;
        baseDir = path.resolve(config.dir);
    },
    // 检查一个路径
    exec: function(name, base) {
        content = Object.create(null);
        loop(name, base);
        return content;
    }
};


// export
module.exports = traverse;
