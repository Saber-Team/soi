
var proto = {
  getName: function() {
    return this.name;
  },
  setName: function(n) {
    this.name = n;
  },
  name: 'default'
};

var inst1 = Object.create(proto);
var inst2 = Object.create(proto);

console.log(inst1.getName());
inst1.setName('inst1');
console.log(inst1.getName());
console.log(inst2.getName());

inst2.setName('inst2');
console.log(inst1.getName());
console.log(inst2.getName());