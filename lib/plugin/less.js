/**
 * @file less编译, 不需要覆盖Task中的方法,只需要遍历资源表中
 *       less文件,然后编译成css文件,后续由css插件处理.
 * @author XCB
 */
var lessc = require('less');

var less = module.exports = {};


less.init = function (task) {
    this.task = task;
    this.render();
};

less.render = function () {
  // TODO
    lessc.render();
};