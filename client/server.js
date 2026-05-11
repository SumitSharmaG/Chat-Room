// Complete server.js for Private Chat with User Online Check

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, adjust as necessary for production
  },
});

// Store online users: username (lowercase) => socket.id
const onlineUsers = new Map();

// Serve static files if needed (not used here, but for production)
// app.use(express.static('public'));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a user joins, register their username
  socket.on("userJoined", (username) => {
    if (username) {
      // Save user to online list
      onlineUsers.set(username.toLowerCase(), socket.id);
      console.log(`User joined: ${username}`);
      // Notify all clients of updated online users
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });

  // When a user disconnects, remove from online list
  socket.on("disconnect", () => {
    // Find the username associated with this socket
    for (let [user, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(user);
        console.log(`User disconnected: ${user}`);
        break;
      }
    }
    // Broadcast updated list
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Handle check if specific user is online
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

    // Find receiver socket id
    const receiverId = onlineUsers.get(receiver.toLowerCase());

    // Prepare message object
    const messageData = {
      sender,
      receiver,
      text,
      timestamp,
    };

    // Send to receiver if online
    if (receiverId) {
      io.to(receiverId).emit("receiveMessage", messageData);
    }

    // Also, send the message back to sender for display
    // (Optional: Remove if you handle message display differently)
    const senderId = onlineUsers.get(sender.toLowerCase());
    if (senderId) {
      io.to(senderId).emit("receiveMessage", messageData);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
