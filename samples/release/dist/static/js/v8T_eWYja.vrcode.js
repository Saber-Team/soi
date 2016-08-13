__d("vrcode", function(require, exports, module) {
'use strict';

/**
 * @provides vrcode
 * @module
 */

exports.isPast = function () {
  return Boolean('<%$_REQUEST["token"]%>');
};
});