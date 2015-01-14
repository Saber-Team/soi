var list = [];
var require = {
  async: function(module) {
    if (list.indexOf(module) === -1) {
      list.push(module);
    }
  }
};