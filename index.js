const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  io.emit(
    'connection_change', 
    {
      msg: 'a user connected!',
      userCount: io.engine.clientsCount,
    },
  );

  socket.username = 'anonymous';
  socket.usercode = socket.id.substring(0, 5);

  socket.emit(
    'initial_connect', 
    {
      username: socket.username,
      usercode: socket.usercode,
      userCount: io.engine.clientsCount,
    }
  );

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit(
      'connection_change',
      {
        msg: 'a user disconnected',
        userCount: io.engine.clientsCount,
      },
    );
  });
});

io.on('connection', (socket) => {
  socket.on('chat_message', (msg) => {
    console.log('message: ' + msg);
    socket.broadcast.emit('chat_message', `${socket.username}@${socket.usercode}: ${msg}`);
  });
});

io.on('connection', (socket) => {
  socket.on('change_name', (input) => {
    if (input.length <= 0 || input.length > 12) return;
    socket.username = input;
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
