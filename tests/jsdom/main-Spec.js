var jsdom = require('jsdom');

jsdom.env({
  url: "test.html",
  scripts: [],
  done: function (errors, window) {
    debugger;
    console.log(window.list);
  }
});