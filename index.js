const fs = require('fs');
const loadJson = (f) => {
  return JSON.parse(fs.readFileSync(f));
}

const settings = loadJson('settings.json');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use('/', express.static('static'));
http.listen(settings.httpPort, () => {
  console.log('listening on *:' + settings.httpPort);
});

const { Client } = require('node-osc');
const client = new Client('127.0.0.1', 57120);

io.on('connection', (socket) => {
  console.log('a socket io user connected');
  socket.on('slide', (msg) => {
    client.send('/control/0' + msg.id, parseInt(msg.val), () => {
    });
  })
});
