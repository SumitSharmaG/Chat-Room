// server.js - Full working server for private chat with user online check

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production as needed
  },
});

// Store online users: username (lowercase) -> socket.id
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a user joins, register their username
  socket.on("userJoined", (username) => {
    if (username) {
      onlineUsers.set(username.toLowerCase(), socket.id);
      console.log(`User joined: ${username}`);
      // Broadcast updated online users list
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });

  // When a user disconnects, remove from online list
  socket.on("disconnect", () => {
    let disconnectedUser = null;
    for (const [user, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(user);
        disconnectedUser = user;
        console.log(`User disconnected: ${user}`);
        break;
      }
    }
    // Broadcast updated list
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Check if a specific user is online
  socket.on("checkUserOnline", (username) => {
    if (!username) {
      socket.emit("userOnlineStatus", { username: "", online: false });
      return;
    }
    const userKey = username.toLowerCase();
    if (onlineUsers.has(userKey)) {
      socket.emit("userOnlineStatus", { username: userKey, online: true });
    } else {
      socket.emit("userOnlineStatus", { username: userKey, online: false });
    }
  });

  // Handle sending a private message
  socket.on("sendMessage", (data) => {
    const { sender, receiver, text, timestamp } = data;
    if (!sender || !receiver || !text) return;

    const receiverId = onlineUsers.get(receiver.toLowerCase());
    const senderId = onlineUsers.get(sender.toLowerCase());

    const messagePayload = {
      sender,
      receiver,
      text,
      timestamp,
    };

    // Send message to receiver if online
    if (receiverId) {
      io.to(receiverId).emit("receiveMessage", messagePayload);
    }

    // Echo message back to sender for display
    if (senderId) {
      io.to(senderId).emit("receiveMessage", messagePayload);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
