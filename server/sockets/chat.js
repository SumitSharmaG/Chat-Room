const Message = require("../models/Message");

// 🔥 UNIQUE USERS TRACK (username → multiple sockets)
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // 🔹 TYPING
socket.on("typing", (username) => {
  socket.broadcast.emit("userTyping", username);
});

socket.on("stopTyping", (username) => {
  socket.broadcast.emit("userStopTyping", username);
});

// 🔹 SEEN
socket.on("messageSeen", async ({ messageId, username }) => {
  try {
    const msg = await Message.findById(messageId);

    if (!msg.seenBy) msg.seenBy = [];

    if (!msg.seenBy.includes(username)) {
      msg.seenBy.push(username);
      await msg.save();
    }

    io.emit("updateSeen", {
      messageId,
      seenBy: msg.seenBy
    });

  } catch (err) {
    console.error(err);
  }
});
  

    // 🔹 USER JOIN EVENT
    socket.on("userJoined", (username) => {
      socket.username = username;

      // Agar user already exist hai
      if (onlineUsers.has(username)) {
        onlineUsers.get(username).add(socket.id);
      } else {
        onlineUsers.set(username, new Set([socket.id]));
      }

      console.log("🔥 Online Users:", onlineUsers);

      // 🔥 COUNT = unique users
      io.emit("updateUserCount", onlineUsers.size);
    });

    // 🔹 MESSAGE SEND (same)
    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        io.emit("receiveMessage", msg);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // 🔹 CLEAR CHAT
    socket.on("clearAllChat", async () => {
      try {
        await Message.deleteMany({});
        io.emit("chatCleared");
      } catch (err) {
        console.error("Clear error:", err);
      }
    });

    // 🔻 DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const username = socket.username;

      if (username && onlineUsers.has(username)) {
        const userSockets = onlineUsers.get(username);

        // socket remove karo
        userSockets.delete(socket.id);

        // agar koi socket nahi bacha → user offline
        if (userSockets.size === 0) {
          onlineUsers.delete(username);
        }
      }

      console.log("🔥 After Disconnect:", onlineUsers);

      // 🔥 COUNT UPDATE
      io.emit("updateUserCount", onlineUsers.size);
    });
  });
};
