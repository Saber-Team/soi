require(['./g'], function(g) {
  console.log(g.key);
  require.async('./h', function(h) {
    console.log(h.key);
  })
});