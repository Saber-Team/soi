require(['./i'], function(i) {
  require.async('./j', function() {

  })
});