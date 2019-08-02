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

const sliders = settings.sliders;

// https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
process.stdin.resume();//so the program will not close instantly

const exitHandler = (options, exitCode) => {
  const newSettings = JSON.stringify({...settings, ...{sliders},});

  fs.writeFileSync('settings.json', newSettings);
  console.log('message: ' + newSettings);

  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
// // catches "kill pid" (for example: nodemon restart)
// process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
// process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

io.on('connection', (socket) => {
  console.log('a socket io user connected');
  io.emit('sliders', {sliders});
  for(let i in sliders) {
    client.send('/control/0' + i, parseInt(sliders[i]), () => {});
  }
  socket.on('slide', (msg) => {
    sliders[msg.id] = parseInt(msg.val);
    client.send('/control/0' + msg.id, parseInt(msg.val), () => {
    });
  })
});
