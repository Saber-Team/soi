/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */
var lessc = require('less');
var inherits = require('util').inherits;
var path = require('path');

var defaultOptions = {
    sync : true,
    isSync: true
};

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

        var content = resource.getContent() || '';
        resource.originLessContent = content;
        var depContent = '';
        var deps = resource.requiredCSS;
        if (deps && deps.length) {
            deps.forEach(function(dep) {
                var p = soi.util.getPath(resource.path, dep);
                var r = task.host.getMap().getResourceByPath(p);
                depContent  += '\n ' +  (r.getContent() || r.originLessContent);
            });
            content = depContent + content;
        }
        //debugger

        lessc.render(content, this.options, function(e, output) {
            if (e) {
                soi.log.error('Render less[' + resource.path + '] error: [' + e.message +']');
                process.exit();
            }
            var result = output.css || '  '; //写几个空值,这样fileContent就不为空了,哈哈
            resource.setContent(result);

        });
    }
};

LessCompiler.prototype.uninstall = function() {
    this.host.removeListener('pre-compile-resource', this.exec);
};

module.exports = LessCompiler;