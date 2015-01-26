define(function() {
  return {
    exec: function() {
      require.async('./f', function(f) {

      });
    }
  }
});