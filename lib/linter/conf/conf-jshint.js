module.exports = {
  encoding: 'utf8',
  debug: true,
  reporter: require('jshint-stylish'),
  rules: {
    bitwise   : false,
    camelcase : false,
    curly     : true,
    eqeqeq    : true,
    es3       : true,
    forin     : false,
    freeze    : true,
    globals   : {
      require : true,
      define  : true,
      oslojs  : true
    },
    nonew     : true,
    undef     : true,
    unused    : true
  }
};