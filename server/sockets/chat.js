// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// chat.js
// PART 1 / 3
// ==========================================

"use strict";

const chunkReceiver =
    require("./chunkReceiver");

const Message =
    require("../models/Message");

const jwt =
    require("jsonwebtoken");



// ==========================
// Online Users
// ==========================

const onlineUsers =
    new Map();



// ==========================
// Typing Users
// ==========================

const typingUsers =
    new Set();



// ==========================
// Export
// ==========================

module.exports=(io)=>{



// ==========================
// JWT Authentication
// ==========================

io.use(

(socket,next)=>{

try{

const token=

socket.handshake

.auth.token;

if(!token){

return next(

new Error(

"No Token"

)

);

}

const decoded=

jwt.verify(

token,

process.env

.JWT_SECRET

);

socket.user=

decoded;

next();

}

catch(err){

return next(

new Error(

"Invalid Token"

)

);

}

}

);



// ==========================
// Connection
// ==========================

io.on(

"connection",

(socket)=>{

console.log(

"✅ Connected:",

socket.user

.username

);



// ==========================
// Register Chunk Receiver
// ==========================

chunkReceiver(

io,

socket,

onlineUsers

);

  // ==========================
// Typing
// ==========================

socket.on(

"typing",

(username)=>{

if(

!typingUsers.has(

username

)

){

typingUsers.add(

username

);

socket.broadcast.emit(

"userTyping",

username

);

}

}

);



socket.on(

"stopTyping",

(username)=>{

typingUsers.delete(

username

);

socket.broadcast.emit(

"userStopTyping",

username

);

}

);



// ==========================
// Seen
// ==========================

socket.on(

"messageSeen",

async({

messageId,

username

})=>{

try{

const msg=

await Message

.findById(

messageId

);

if(!msg)

return;

msg.seenBy||=[];

if(

!msg.seenBy

.includes(

username

)

){

msg.seenBy

.push(

username

);

await msg.save();

}

io.emit(

"updateSeen",{

messageId,

seenBy:

msg.seenBy

}

);

}

catch(err){

console.error(

"Seen:",

err

);

}

}

);



// ==========================
// User Joined
// ==========================

socket.on(

"userJoined",

()=>{

const username=

socket.user

.username;

socket.username=

username;

if(

onlineUsers.has(

username

)

){

onlineUsers

.get(username)

.add(

socket.id

);

}

else{

onlineUsers.set(

username,

new Set([

socket.id

])

);

}

io.emit(

"updateUserCount",

onlineUsers.size

);

}

);



// ==========================
// World Chat
// ==========================

socket.on(

"sendMessage",

async(data)=>{

try{

data.username=

socket.user

.username;

const msg=

await Message

.create(data);

io.emit(

"receiveMessage",

msg

);

}

catch(err){

console.error(

"Message:",

err

);

}

}

);

  // ==========================
// Private Chat
// ==========================

socket.on(

"private_message",

(data)=>{

data.sender=

socket.user

.username;

data.sender=

data.sender

.replace(

"@",""

);

data.receiver=

data.receiver

.replace(

"@",""

);

for(

const[

username,

sockets

]

of onlineUsers

){

if(

username===

data.sender

||

username===

data.receiver

){

sockets.forEach(

socketId=>{

io.to(

socketId

).emit(

"receive_private_message",

data

);

}

);

}

}

}

);



// ==========================
// Clear Chat
// ==========================

socket.on(

"clearAllChat",

async()=>{

try{

await Message

.deleteMany({});

io.emit(

"chatCleared"

);

}

catch(err){

console.error(

"Clear:",

err

);

}

}

);



// ==========================
// Disconnect
// ==========================

socket.on(

"disconnect",

()=>{

const username=

socket.username;

if(

username&&

onlineUsers.has(

username

)

){

const sockets=

onlineUsers.get(

username

);

sockets.delete(

socket.id

);

if(

sockets.size===0

){

onlineUsers.delete(

username

);

}

}

if(

username&&

typingUsers.has(

username

)

){

typingUsers.delete(

username

);

socket.broadcast.emit(

"userStopTyping",

username

);

}

io.emit(

"updateUserCount",

onlineUsers.size

);

console.log(

"❌ Disconnected:",

socket.id

);

}

);

});

};
