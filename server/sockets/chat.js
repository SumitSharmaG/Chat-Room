const Message = require("../models/Message");

// 🔥 UNIQUE USERS TRACK
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected");

    // 🔹 USER JOIN EVENT
    socket.on("userJoined", (username) => {
      socket.username = username;

      // Agar same user multiple tabs open kare
      // to Map me overwrite hoga (duplicate nahi banega)
      onlineUsers.set(username, socket.id);

      console.log("Online Users:", onlineUsers);

      // 🔥 COUNT UPDATE
      io.emit("updateUserCount", onlineUsers.size);
    });

    // 🔹 MESSAGE SEND (unchanged)
    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        io.emit("receiveMessage", msg);
      } catch (err) {
        console.error("Message error:", err);
      }
    });

    // 🔹 CLEAR CHAT (agar use kar rahe ho)
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
      console.log("User disconnected");

      if (socket.username) {
        onlineUsers.delete(socket.username);
      }

      // 🔥 COUNT UPDATE
      io.emit("updateUserCount", onlineUsers.size);
    });
  });
};
