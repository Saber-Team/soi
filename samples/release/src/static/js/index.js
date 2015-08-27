require(['./a', './b'], function(a, b) {

  var img = kerneljs.url('../img/banner.png');

  console.log(a.name);
});