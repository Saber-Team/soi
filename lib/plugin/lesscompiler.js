/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */
var lessc = require('less');

var defaultOptions = {};
function Less (options) {
    // 合并配置对象
    this.options = soi.util.merge(Object.create(null), defaultOptions, options|| {});
}

Less.prototype.init = function (task) {
    this.host = task;
    this.exec = this.exec.bind(this);
    task.on('pre-compile-resource', this.exec);
};

Less.prototype.exec = function () {
  // TODO
    if (resource.type === 'CSS') {
    lessc.render();
};