var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('socket.io-redis');
var config = require('./config');
io.adapter(redis({ host: config.REDIS_ENDPOINT, port: 6379 }));
var Commands = require('./enums/commands');

var RoomEventsController = require('./controllers/room-events-controller');

// Lower the heartbeat timeout
io.set('heartbeat timeout', 8000);
io.set('heartbeat interval', 4000);

var port = config.PORT || 3000;

server.listen(port, function() {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.on(Commands.ON_CONNECT, function(socket) {
  socket.on(Commands.ON_JOIN, function(request){
    RoomEventsController.joinRoom(socket, request);
  });

  socket.on(Commands.ON_SEND_MESSAGE, function(request){
    RoomEventsController.sendMessage(socket, request);
  });

  socket.on(Commands.ON_DISCONNECT, function() {
      RoomEventsController.leaveRoom(socket);
  });

  socket.on(Commands.ON_ADD_STREAM, function(request){
      RoomEventsController.addStream(socket, request);
  });

  socket.on(Commands.ON_GET_ROOM_DETAILS, function(request){
    RoomEventsController.getRoomDetails(socket, request);
});

  // // when the client emits 'new message', this listens and executes
  // socket.on('new message', function(data) {
  //   // we tell the client to execute 'new message'
  //   socket.broadcast.emit('new message', {
  //     username: socket.username,
  //     message: data
  //   });
  // });

  // socket.conn.on('heartbeat', function() {
  //   if (!addedUser) {
  //     // Don't start upserting until the user has added themselves.
  //     return;
  //   }

  //   PresenceRepository.upsert(socket.id, {
  //     username: socket.username
  //   });
  // });

  // // when the client emits 'add user', this listens and executes
  // socket.on('add user', function(username) {
  //   if (addedUser) {
  //     return;
  //   }

  //   // we store the username in the socket session for this client
  //   socket.username = username;
  //   PresenceRepository.upsert(socket.id, {
  //     username: socket.username
  //   });
  //   addedUser = true;

  //   PresenceRepository.list(function(users) {
  //     socket.emit('login', {
  //       numUsers: users.length
  //     });

  //     // echo globally (all clients) that a person has connected
  //     socket.broadcast.emit('user joined', {
  //       username: socket.username,
  //       numUsers: users.length
  //     });
  //   });
  // });

  // // when the client emits 'typing', we broadcast it to others
  // socket.on('typing', function() {
  //   socket.broadcast.emit('typing', {
  //     username: socket.username
  //   });
  // });

  // // when the client emits 'stop typing', we broadcast it to others
  // socket.on('stop typing', function() {
  //   socket.broadcast.emit('stop typing', {
  //     username: socket.username
  //   });
  // });
});
