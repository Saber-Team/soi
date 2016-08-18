__d("tospe", function(require, exports, module) {
'use strict';

/**
 * @module
 */

exports.isPast = function () {
  return Boolean('<%$_REQUEST["token"]%>');
};
});