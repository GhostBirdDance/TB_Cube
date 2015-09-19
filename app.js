var net = require('net');
var express = require('express');
var app = express();
var io = require('socket.io').listen(app.listen(8080));
var fs = require('fs');
var uuid = require('node-uuid');

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

    var client, csv = '';

    socket.on('restart', connect);

    function receive(data) {
      var resp = data.toString();
      if (/acceleration/ig.test(resp)) {
        socket.emit('message', resp);
        var xm = resp.match(/\"x\"\s\:\s([\-0123456789\.]*)/);
        var ym = resp.match(/\"y\"\s\:\s([\-0123456789\.]*)/);
        var zm = resp.match(/\"z\"\s\:\s([\-0123456789\.]*)/)
        csv += xm[1] + ', ' + ym[1] + ', ' + zm[1] + '\n';
      }
      client.end();
    }

    function end() {
      var filename = './logs/' + uuid.v4() + '.csv';
      fs.writeFile(filename, csv, function(err) {
        if (err) throw err;
        console.log('saved', filename);
        csv = '';
      });
      socket.emit('ended');
    }

    function connect() {

      if (csv) {
        end();
      }

      client = net.connect(9191, '192.168.100.119', function() {
        csv = 'x, y, z\n';
        socket.emit('connected');
      });
      client.on('data', receive);
      client.on('end', end);

    }

  });