
/**
 * @interface
 */
function Resolver() { }

Resolver.prototype.combo = function() {
  throw 'SubClass of Resolver should implements combo method';
};

Resolver.prototype.resolve = function() {
  throw 'SubClass of Resolver should implements resolve method';
};

module.exports = Resolver;