
/**
 * @interface
 */
function Resolver() { }


Resolver.prototype.resolve = function() {
    throw 'SubClass of Resolver should implements resolve method';
};


module.exports = Resolver;