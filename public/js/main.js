const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from url:
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});
console.log(username, room);

const socket = io();
//message from server
socket.on('message', message=>{
    console.log(message);
    outputMessage(message);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//join chatroom
socket.emit('JoinRoom', { username, room });

//get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//On message submit:
chatForm.addEventListener('submit', (e)=>{
    console.log(e);
    e.preventDefault(); //prevent the default behavior-> sending the message to a file
    //get message text
    const msg = e.target.elements.msg.value;
    //emit message to server
    socket.emit('ChatMessage', msg);
    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
					 <p class="text">
							${message.text}
					 </p>`;
	document.querySelector('.chat-messages').appendChild(div);
}

//Add Room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}
// add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
     `;
}