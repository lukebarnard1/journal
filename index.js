var express = require('express')
var app = express()

app.use('/static', express.static(__dirname + '/web'));

var port = 4000;

var path = require('path');

app.all('*', function(req, res){
  var options = {
    root: path.join(__dirname, 'web'),
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };
  res.sendFile('index.html', options);
});

console.log('Express started: http://localhost:' + port + '/');
app.listen(port);
