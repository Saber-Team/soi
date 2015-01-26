require(['./p'], function(p) {
  require.async('./p', function() {})
});