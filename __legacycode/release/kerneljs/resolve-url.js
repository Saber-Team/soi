/**
 * @fileoverview 对于js文件的资源定位需要解析kerneljs
 *   提供的`kerneljs.url`方法调用，将其替换成资源线上路径。
 * @email zmike86@gmail.com
 * @author AceMood
 */

'use strict';

// import modules
var UglifyJS = require('uglify-js');

var ast;
var walker;
var visitCallBack;


/**
 * 语法树遍历访问器.
 * @param {AST_Node} node
 * @param {Function} descend
 * @returns {boolean}
 */
var visitor = function (node, descend) {
  if (node instanceof UglifyJS.AST_Call &&
    node.expression &&
    node.expression instanceof UglifyJS.AST_Dot &&
    node.expression.property === 'url' &&
    node.expression.expression &&
    node.expression.expression instanceof UglifyJS.AST_SymbolRef &&
    node.expression.expression.name === 'kerneljs') {

    var url;
    if (node.args.length > 0) {
      var src = node.args[0];
      if (src instanceof UglifyJS.AST_String) {
        url = src.getValue();
        src.value = visitCallBack(url);
      }
    }
  }
};


/**
 * 遍历语法树
 * @param {String} code JavaScript代码
 * @param {?Function} cb 解析出调用后的回调函数
 * @return {String} JavaScript代码
 */
var run = function (code, cb) {
  clear();

  ast = UglifyJS.parse(code);
  visitCallBack = cb ? cb : function () {};
  walker = new UglifyJS.TreeWalker(visitor);
  ast.walk(walker);

  return ast.print_to_string();
};


/** 重置 */
var clear = function() {
  ast = void 0;
  walker = void 0;
  visitCallBack = void 0;
};


// 导出
exports.run = run;
exports.clear = clear;