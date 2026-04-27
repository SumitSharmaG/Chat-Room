const Message = require("../models/Message");

// 🔥 UNIQUE USERS TRACK (username → multiple sockets)
const onlineUsers = new Map();

// 🔥 TRACK TYPING USERS
const typingUsers = new Set();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ================== TYPING ==================

    socket.on("typing", (username) => {
      // अगर पहले से typing कर रहा है तो दुबारा emit नहीं
      if (!typingUsers.has(username)) {
        typingUsers.add(username);
        socket.broadcast.emit("userTyping", username);
      }
    });

    socket.on("stopTyping", (username) => {
      typingUsers.delete(username);
      socket.broadcast.emit("userStopTyping", username);
    });

    // ================== SEEN ==================

    socket.on("messageSeen", async ({ messageId, username }) => {
      try {
        const msg = await Message.findById(messageId);

        if (!msg) return;

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
        console.error("Seen error:", err);
      }
    });

    // ================== USER JOIN ==================

    socket.on("userJoined", (username) => {
      socket.username = username;

      if (onlineUsers.has(username)) {
        onlineUsers.get(username).add(socket.id);
      } else {
        onlineUsers.set(username, new Set([socket.id]));
      }

      console.log("🔥 Online Users:", onlineUsers);

      io.emit("updateUserCount", onlineUsers.size);
    });

    // ================== MESSAGE ==================

    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        io.emit("receiveMessage", msg);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // ================== CLEAR CHAT ==================

    socket.on("clearAllChat", async () => {
      try {
        await Message.deleteMany({});
        io.emit("chatCleared");
      } catch (err) {
        console.error("Clear error:", err);
      }
    });

    // ================== DISCONNECT ==================

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const username = socket.username;

      // 🔹 remove from online users
      if (username && onlineUsers.has(username)) {
        const userSockets = onlineUsers.get(username);

        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(username);
        }
      }

      // 🔹 remove from typing users
      if (username && typingUsers.has(username)) {
        typingUsers.delete(username);
        socket.broadcast.emit("userStopTyping", username);
      }

      console.log("🔥 After Disconnect:", onlineUsers);

      io.emit("updateUserCount", onlineUsers.size);
    });
  });
};
