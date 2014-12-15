
var Module = require('./module/module.js');

// name should be unique Id
var define = function(name, deps, factory) {
    var dList = checkDependency(deps);

    // 对象字面量
    if (toString.call(factory) === '[object Object]') {
        exportPath(name, factory);
    }
    // 回调函数
    else if (toString.call(factory) === '[object Function]') {
        exportPath(name, factory.apply(global, dList));
    }
    else {
        throw new Error('When define a module, the export should be an object' +
            ' or a factory function. It is illegal for module ' + name);
    }



    // todo

    var mod = new Module();

    return name;
};


// cause entry point file could be unshifted
// so no-name module is ok
var req = function(deps, factory) {
    var dList = checkDependency(deps);
    factory.apply(null, dList);
    // 不做全局导出
    // todo
    return true;
};


// load module on demand
req.async = function(module_id, callback) {

};


exports.require = req;
exports.define = define;

