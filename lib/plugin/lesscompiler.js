/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */

var lessc = require('less');
var path = require('path');
var fs = require('fs');

var importReg = /@import\s*(["'])([^'"\s]+)\1\s*/g;

var defaultOptions = {
    sync : true
};
var cacheFileData = {};

function LessCompiler (options) {
    // 合并配置对象
    options = options || {};
    this.options = soi.util.merge({}, defaultOptions, options);
}

LessCompiler.prototype.init = function (task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
};

LessCompiler.prototype.exec = function (resource) {
    var task = this;
    if (resource.type === 'CSS' && soi.util.basename(resource.path).indexOf('.less') > -1) {
        /*less编译import时不知道为何不执行,暂时先手动替换import*/
        var content = resource.getContent() || '';
        var absPath = path.resolve(path.dirname(resource.path));

        //content = content.replace(importReg, function(match, $1, $2) {
        //    var url = path.join(absPath, $2);
        //    if (cacheFileData[url]) {
        //        return cacheFileData[url];
        //    }
        //    var depContent = fs.readFileSync(url).toString();
        //    cacheFileData[url] = depContent;
        //    return depContent;
        //});

        //task.options.paths = [absPath, path.dirname(resource.path)];
        //task.options.filename = path.resolve(resource.path);
        //debugger

        lessc.render(content, task.options, function(e, output) {
            //debugger
            if (e) {
                soi.log.error('Render less[' + resource.path + '] error: [' + e.message +']');
                process.exit();
            }
            var result = output.css || ' '; //写几个空值,这样fileContent就不为空了,哈哈
            resource.setContent(result);
        });
        //debugger
    }
};

LessCompiler.prototype.uninstall = function() {
    this.host.removeListener('pre-compile-resource', this.exec);
};

module.exports = LessCompiler;