/**
 * @fileoverview 对于cmd格式的js模块文件的需要解析require调用地方，
 *   将其替换成该路径模块的id。
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
      node.expression instanceof UglifyJS.AST_SymbolRef &&
      node.expression.name === 'require') {

    var url;
    if (node.args.length === 1) {
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