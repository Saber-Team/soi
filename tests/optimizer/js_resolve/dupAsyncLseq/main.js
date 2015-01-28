require(['./a', './c', './b'], function(a, c, b) {
  a.exec();
  b.exec();
  require.async('./c', function(c) {
    c.exec();
  })
});