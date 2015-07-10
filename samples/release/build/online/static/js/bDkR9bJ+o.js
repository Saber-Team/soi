define("_1", [], {"name":"a"});
define("_2", ["_3"], function (lib) {
  return {
    name: lib.name
  }
});
require(["_1","_2"], function (a, b) {
    console.log(a.name);
});