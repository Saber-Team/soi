// 系统模块引用
var fs = require('fs');
var path = require('path');
var buffer = require('buffer');

// 自定义模块
var calculate = require('./mods/calculate.js');
var traverse = require('./mods/traverse.js');

var js_config = require('./../config/js-place-config.js');

// 局部变量
var map = {};
var content, str = '';
var prefix_str = '<script type="text/javascript" src="';
var suffix_str = '"></script>';

function extend(target, src) {
    for(var k in src)
        target[k] = src[k];
}

function cal() {

    // step1 引入路径映射
    js_config.imports.forEach(function(file) {
        extend(map, JSON.parse(fs.readFileSync(path.resolve(file), { encoding: js_config.encoding })));
    });

    // step2 计算业务代码映射
    js_config.dirs.forEach(function(dir) {
        traverse.config({
            Preserved: js_config.Preserved,
            jsFileExt: js_config.jsFileExt,
            otherFileExt: js_config.otherFileExt,
            encoding: js_config.encoding,
            debug: js_config.debug,
            dir: path.resolve(dir)
        });
        content = traverse.exec(js_config.build_base, path.resolve(dir));
        extend(map, content);
    });

    // step3 计算依赖\输出
    var input = js_config.input_file;
    var bootfile = js_config.boot;
    var scripts = calculate(input, map, js_config);
    var output_base = path.resolve(js_config.output_base);
    var build_base = path.resolve(js_config.build_base);

    scripts.unshift(bootfile);
    scripts = scripts.map(function(abspath) {
        var p = path.relative(output_base, abspath);
        str += prefix_str + p.replace(/\\/g, '/') + suffix_str + '\n';
        p = path.relative(build_base, abspath);
        return p.replace(/\\/g, '/');
    });

    // console.log(scripts);

    // step4 写入json内容
    fs.writeFileSync(path.resolve(js_config.output_file), str);

    return scripts;
}

// export
module.exports.config = function(src) {
    extend(js_config, src);
};

module.exports.calculate = cal;
