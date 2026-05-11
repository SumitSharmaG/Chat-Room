const Message = require("../models/Message");
const onlineUsers = new Map();
const typingUsers = new Set();

module.exports = (io) => {
  io.on("connection", (socket) => {
    
    socket.on("userJoined", (username) => {
      socket.username = username;
      if (!onlineUsers.has(username)) {
        onlineUsers.set(username, new Set([socket.id]));
      } else {
        onlineUsers.get(username).add(socket.id);
      }
      io.emit("updateUserCount", onlineUsers.size);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const msg = await Message.create(data);
        
        if (data.receiver === "world") {
          io.emit("receiveMessage", msg);
        } else {
          // Private Logic: Send only to sender & receiver
          const rSockets = onlineUsers.get(data.receiver);
          const sSockets = onlineUsers.get(data.username);
          if (rSockets) rSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
          if (sSockets) sSockets.forEach(id => io.to(id).emit("receiveMessage", msg));
        }
      } catch (err) {
        console.error("Msg Error:", err);
      }
    });

    socket.on("typing", (data) => {
      // data: { username, receiver }
      socket.broadcast.emit("userTyping", data);
    });

    socket.on("stopTyping", (data) => {
      socket.broadcast.emit("userStopTyping", data);
    });

    socket.on("messageSeen", async ({ messageId, username }) => {
      try {
        const msg = await Message.findById(messageId);
        if (msg && !msg.seenBy.includes(username)) {
          msg.seenBy.push(username);
          await msg.save();
          io.emit("updateSeen", { messageId, seenBy: msg.seenBy });
        }
      } catch (err) {}
    });

    socket.on("disconnect", () => {
      const u = socket.username;
      if (u && onlineUsers.has(u)) {
        onlineUsers.get(u).delete(socket.id);
        if (onlineUsers.get(u).size === 0) onlineUsers.delete(u);
      }
      io.emit("updateUserCount", onlineUsers.size);
    });
  });
};
      
