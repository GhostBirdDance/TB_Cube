var net = require('net');
var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(8080));
var fs = require('fs');

var pages = {
  index: fs.readFileSync(__dirname + '/app/index.html')
};

var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log(addresses);

app
  .use(express.static(__dirname + '/app'))
  .get('/', function(req, res) {
    res.send(pages.index);
  });

io.sockets
  .on('connection', function(socket) {

    var client;

    socket.on('restart', connect);

    function connect() {

      client = net.connect(9191, '192.168.1.2', function() {
        socket.emit('connected');
      });
      client.on('data', function(data) {
        var resp = data.toString();
        if (/acceleration/ig.test(resp)) {
          socket.emit('message', resp);
        }
        client.end();
      });
      client.on('end', function() {
        socket.emit('ended');
      });

    }

  });