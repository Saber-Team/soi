'use strict';

// 3rd-party
var UglifyJS = require('uglify-js');
var chalk = require('chalk');

// local vars
var urls = [];
var toplevel;
var walker;

/**
 * Visitor function for traversing.
 * @param {AST_Node} node
 * @param {Function} descend
 * @returns {boolean}
 */
var visitor = function(node, descend) {
  if (node instanceof UglifyJS.AST_Call &&
    node.expression &&
    node.expression instanceof UglifyJS.AST_Dot &&
    node.expression.property === 'async' &&
    node.expression.expression &&
    node.expression.expression instanceof UglifyJS.AST_SymbolRef &&
    node.expression.expression.name === 'require') {
    var url;
    if (node.args.length > 0) {
      var mod = node.args[0];
      if (mod instanceof UglifyJS.AST_String) {
        url = mod.getValue();
        if (urls.indexOf(url) === -1) {
          urls.push(url);
        }
      }
      /*
      else if (mod instanceof UglifyJS.AST_SymbolRef) {
        debugger;
        var scope = walker.find_parent(UglifyJS.AST_Scope);
        toplevel.figure_out_scope();
        url = scope.find_variable(mod.name);
        url = url.init.getValue();
        if (urls.indexOf(url) === -1) {
          urls.push(url);
        }
      }*/
      else {

      }
    }
  }
};

/**
 * traverse ast tree
 * @param {String} code JavaScript File code.
 */
var retrieve = function(code) {
  clear();

  toplevel = UglifyJS.parse(code);
  walker = new UglifyJS.TreeWalker(visitor);
  toplevel.walk(walker);

  return urls;
};

var clear = function() {
  toplevel = null;
  walker = null;
  urls = [];
};

module.exports = retrieve;