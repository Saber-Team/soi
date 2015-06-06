/**
 * @fileoverview 发送数据流到服务器
 * @author zmike86
 * @email zmike86@gmail.com
 */


/**
 *
 * @param {Object} config
 * @param {Object} argv
 */
function post(config, argv) {
  var postData = querystring.stringify({
    'msg' : 'Hello World!'
  });

  var config = config || {
    hostname: 'www.google.com',
    port: 80,
    path: '/soi_receiver.php',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var req = http.request(config, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

// write data to request body
  req.write(postData);
  req.end();
}

exports.post = post;