
'use strict';

var _cache = Object.create(null);

var record = exports.record = function(token) {
  _cache[token] = Date.now();
};

var log = exports.log = function(token) {

};