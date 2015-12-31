var lessc = require('less');
var path = require('path');
var fs = require('fs');

var content = fs.readFileSync('./less/a.less', 'utf8');

lessc.render(content, {
  relativeUrls: true,
  sync : true,
  paths: ['less']
}, function(e, output) {
  if (e) {
    console.error('Render less] error: [' + e.message +']');
  }

  fs.writeFileSync('./less/res.css', output.css, 'utf8');

});