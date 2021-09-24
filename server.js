//format message
const formatMessage = require('./utils/messages.js');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users.js');

//use path module (nodejs module)
const path = require('path');
const http = require('http');

const express = require('express');
const app = express();

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app); //used explicitly instead of via express -> needed for socket.io
const socketio = require('socket.io');
const io = socketio(server);

const botName = 'ChatCord Bot';
//run when user connects
io.on('connection', socket =>{

    //join chatroom
    socket.on('JoinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));//->sends only to connecting user

        //Broadcast when a user connects->broadcast sends to all users except the one connecting
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));
        //io.emit(); -> sends to everyone.

        //send users and room info
        io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
        });
    });

    //Listen for chat message
    socket.on('ChatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat!`));
            //send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
});

const PORT = 3000 || process.env.PORT; //checks if port is defined as an environment variable

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));