
/**
 * @interface
 */
function Processor() { }


Processor.prototype.process = function() {
    throw 'SubClass of Processor should implements process method';
};


Processor.prototype.traverse = function() {
    throw 'SubClass of Processor should implements traverse method';
};


module.exports = Processor;