const express = require('express'),
socketio = require('socket.io');
var redis = require("redis"),
client = redis.createClient();
var app = express();
var server = app.listen(8080);
var io = socketio(server);

app.use(express.static('static'));

io.on('connection', (socket) => {
  socket.on('room.join', (room) => {
    console.log(socket.rooms);
    Object.keys(socket.rooms).filter((r) => r != socket.id).forEach((r) => socket.leave(r));

    client.on("error", function (err) {
      console.log("Error " + err);
    });
    client.lrange("user:" + room + ":followerList", 0, -1, function (_err, followers) {
        console.log(followers);
        followers.forEach(function (follower) {
            socket.join(room);
            socket.emit('event',  follower+' Joined ' + room +' session');
            // socket.broadcast.to(room).emit('event', follower+' joined ' + room+' session');
        });
      })
  })
  socket.on('event', (e) => {
    socket.broadcast.to(e.room).emit('event', e.content );
  });

});
