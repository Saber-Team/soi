/**
 * @fileoverview Provide global define function
 * @modified Leo.Zhang
 * @email zmike86@gmail.com
 */

/**
 * provide the global 'define' function in node environment
 * @param {!String} name Module name to be defined, registered in
 *    map cache of modules.
 * @param {!Array} deps Dependencies modules.
 * @param {!Function} factory Export function return an object as
 *   of this module.
 * @return {*}
 */
var define = function(name, deps, factory) {
    // todo
    return name;
};

module.exports = define;
