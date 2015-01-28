require(['./a', './b', './c'], function(a, b, c) {
  a.exec();
  b.exec();
  require.async('./c', function(c) {
    c.exec();
  })
});