const Message = require("../models/Message");

const onlineUsers = new Map(); 
const typingUsers = new Set();

module.exports = (io) => {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // ================== TYPING ==================

    socket.on("typing", (username) => {

      if (!typingUsers.has(username)) {
        typingUsers.add(username);
        socket.broadcast.emit("userTyping", username);
      }

    });

    socket.on("stopTyping", (username) => {

      if (typingUsers.has(username)) {
        typingUsers.delete(username);
        socket.broadcast.emit("userStopTyping", username);
      }

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

      emitOnlineUsers(io, onlineUsers);

    });

socket.on("requestOnlineUsers", () => {
  emitOnlineUsers(io);
});
    // ================== SEND MESSAGE ==================

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

    // ================== CONNECT REQUEST ==================

    socket.on("connectRequest", ({ from, to }) => {

      for (const [user, sockets] of onlineUsers.entries()) {

        if (user === to) {

          for (const id of sockets) {

            io.to(id).emit("connectRequest", { from });

          }

        }

      }

    });

    // ================== CONNECT RESPONSE ==================

    socket.on("connectResponse", ({ from, to, accepted }) => {

      for (const [user, sockets] of onlineUsers.entries()) {

        if (user === to) {

          for (const id of sockets) {

            io.to(id).emit("connectResponse", {
              from,
              accepted
            });

          }

        }

      }

    });

    // ================== DISCONNECT ==================

    socket.on("disconnect", () => {

      const username = socket.username;

      if (username && onlineUsers.has(username)) {

        const set = onlineUsers.get(username);

        set.delete(socket.id);

        if (set.size === 0) {
          onlineUsers.delete(username);
        }

      }

      if (username && typingUsers.has(username)) {
        typingUsers.delete(username);
        socket.broadcast.emit("userStopTyping", username);
      }

      emitOnlineUsers(io, onlineUsers);

      console.log("User disconnected:", socket.id);

    });

  });

};

// ================== HELPERS ==================

function emitOnlineUsers(io, onlineUsers) {

  const users = [];

  for (const [username] of onlineUsers.entries()) {
    users.push(username);
  }

  io.emit("onlineUsers", users);

}
