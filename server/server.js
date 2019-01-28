// built-in nodejs
const http = require('http');
const path = require('path');

// generateMessage
const { generateTextMessage } = require('../utils/generateMessage');

// validation
const { isRealString } = require('../utils/validation');

// Users
const { Users } = require('../utils/users');
let users = new Users();

// package
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public/')

const app = express();
const server = http.createServer(app);
app.use(express.static(publicPath))

// soket
var io = socketIO(server);

io.on('connection', socket => {
    socket.on("joinRoom", (client, callback) => {    
        const { name, room } = client;

        if (!isRealString(name) || !isRealString(room)) {
            return callback('Name and room are required!');
        }

        const { id } = socket;
        let user = null;

        socket.join(room);
        
        // remove user
        user = users.removeUser(id);
        if (user) {
            console.log(`${user.name} removed in room ${user.room}.`);
        }
        
        // add user
        user = users.addUser(id, name, room);
        if (user) {
            console.log(`${user.name} added in room ${user.room}.`);

            // update list users in room
            io.emit("updateUserList", users.getUserList(room));

            // Welcome
            socket.emit("serverResponseTextMessage", generateTextMessage(`Room Owner ${room}`, "Welcome to Chat App!"));
            socket.broadcast.to(room).emit("serverResponseTextMessage", generateTextMessage(`Room Owner ${room}`, `${name} joined room`));
        } else {
            alert("Connect with Error!");
        }

        callback();
    });

    socket.on("clientSendTextMessage", message => {
        const user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('serverResponseTextMessage', message) ;               
        } else {
            alert("Unable to send message!");
        }
    });

    socket.on("clientSendLocationMessage", message => {
        const user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('serverResponseLocationMessage', message) ;               
        } else {
            alert("Unable to fetch location!");
        }
    });

    socket.on("disconnect", () => {
        // remove user
        const user = users.removeUser(socket.id);
        if (user) {
            console.log(`${user.name} removed in room ${user.room}.`);
            
            // update list users in room
            io.emit("updateUserList", users.getUserList(user.room));
            socket.broadcast.to(user.room).emit("serverResponseTextMessage", generateTextMessage(`Room Owner ${user.room}`, `${user.name} left room`));
        } else {
            alert("Disconnect with error!");
        }
    });
})

const PORT = process.env.PORT || 5000;
server.listen(5000, () => {
    console.log(`Server is running on port ${PORT}`);
});
