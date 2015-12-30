alert(1);

function request(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', url, true);
  xhr.onload = function () {
    cb(xhr.responseText);
  };
  xhr.send(null);
}