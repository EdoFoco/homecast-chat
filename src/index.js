// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redis = require('socket.io-redis');
var config = require('./config');
io.adapter(redis({ host: config.REDIS_ENDPOINT, port: 6379 }));

var PresenceRepository = require('./services/presence-repository');
var RoomEventRepository = require('./services/room-event-repository');

// Lower the heartbeat timeout
io.set('heartbeat timeout', 8000);
io.set('heartbeat interval', 4000);

var port = config.PORT || 3000;

server.listen(port, function() {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
  var addedUser = false;
  
  socket.on('join room', function(room){
    console.log('Someone joined the room', room);
    RoomEventRepository.add({
      room: room,
      user: { name: 'hello' },
      type: 'Joined Room',
      socketId: socket.id,
      content: { message: `User Johnny joined room ${room}` }
    })
    .then(() => {
      console.log('Success');
    })
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.conn.on('heartbeat', function() {
    if (!addedUser) {
      // Don't start upserting until the user has added themselves.
      return;
    }

    PresenceRepository.upsert(socket.id, {
      username: socket.username
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    if (addedUser) {
      return;
    }

    // we store the username in the socket session for this client
    socket.username = username;
    PresenceRepository.upsert(socket.id, {
      username: socket.username
    });
    addedUser = true;

    PresenceRepository.list(function(users) {
      socket.emit('login', {
        numUsers: users.length
      });

      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: users.length
      });
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function() {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    if (addedUser) {
      PresenceRepository.remove(socket.id);

      PresenceRepository.list(function(users) {
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: users.length
        });
      });
    }
  });
});
